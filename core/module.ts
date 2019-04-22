/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import * as THREE from "three";
import { Asset } from "./asset";
import { fetchWAsm, fetchModuleAsset } from "./server";
import { generateShapes } from "./draw";
import { Glyph, Font, FontImpl } from "./font";
import {
  Component,
  ComponentInit,
  SlyeComponent,
  PropValue
} from "./component";

const modulesTable: Map<string, Module> = new Map();

/**
 * A module is a Slye extension that might provide a set of components, fonts,
 * template or other functionalities.
 */
export interface Module {
  /**
   * Returns a new instance of the component.
   *
   * @param {string} name Name of the component.
   * @param {Record<string, PropValue>} props Properties.
   * @returns {Component}
   */
  component(name: string, props: Record<string, PropValue>): Component;

  /**
   * Returns name of the registered fonts.
   *
   * @returns {string[]}
   */
  getFonts(): string[];

  /**
   * Returns a font instance which is associated with the given name.
   * @param {string} name Name of the font.
   * @returns {Font}
   */
  font(name: string): Font;
}

/**
 * Module Implementation.
 *
 * @private
 * @see Module
 */
export class ModuleImpl implements Module {
  /**
   * Registered components.
   * Map of componentName -> ComponentInit
   */
  private readonly components: Map<string, ComponentInit> = new Map();

  /**
   * Registered fonts.
   * Map of string to Font.
   */
  private readonly fonts: Map<string, Font> = new Map();

  /**
   * Local assets for this module.
   */
  private readonly assets: Asset<string>;

  /**
   * WebAssembly memory instance for the loaded wasm file.
   */
  private readonly memory: WebAssembly.Memory;

  /**
   * WebAssembly table for the loaded wasm file.
   */
  private readonly table: WebAssembly.Table;

  /**
   * WebAssembly instance for this module.
   */
  private readonly instance: WebAssembly.Instance;

  /**
   * These are used as part of the init process.
   * Once the wasm module is resolved and is accessible this promise
   * is resolved.
   */
  private wait: Promise<void>;
  private waitResolve: () => void;

  /**
   * Whenever we do a foreign function call to the wasm land, it might be
   * a method call for a component, that component is currently in use.
   *
   * void my_component_render(int frame)
   * {
   *         // Do something with component's state.
   * }
   *
   * void my_component()
   * {
   *         on_render(my_component_render);
   * }
   *
   * For example when we call a `render` method of a component we must have
   * access to that component easily so that we can do some stuff with it
   * when ever it is required, this variable is used for that use case.
   *
   * It can be set using `use` method.
   */
  private currentComponent: SlyeComponent;

  /**
   * Uint8Array representation of the wasm module's memory buffer.
   */
  private readonly uint8: Uint8Array;

  /**
   * @param {ArrayBuffer} buffer The wasm file.
   * @param {string} name Name of the current module.
   */
  constructor(buffer: ArrayBuffer, private readonly name: string) {
    this.memory = new WebAssembly.Memory({
      initial: 256
    });

    this.table = new WebAssembly.Table({
      // I don't actually know the range that is suitable for this,
      // so just use my lucky number.
      initial: 10,
      element: "anyfunc"
    });

    const env = {
      memory: this.memory,
      table: this.table,
      __memory_base: 0,
      __table_base: 0,
      // Callable.
      abort() {},
      _register_component: this.registerComponent.bind(this),
      _slog: this.slog.bind(this),
      _load_local: this.loadLocal.bind(this),
      _register_font: this.registerFont.bind(this),

      // For components.
      _on_render: this.onRender.bind(this),
      _on_click: this.onClick.bind(this),
      _new_obj: this.newObj.bind(this),
      _obj_set_string: this.objSetString.bind(this),
      _obj_set_char: this.objSetChar.bind(this),
      _obj_set_num: this.objSetNum.bind(this),
      _get_string_prop_ref: this.getStringPropRef.bind(this),
      _get_font_prop_ref: this.getFontPropRef.bind(this),
      _get_ab_prop_ref: this.getABPropRef.bind(this),
      _get_prop: this.getProp.bind(this),
      _font_layout: this.fontLayout.bind(this),
      _generate_text_geometry: this.generateTextGeometry.bind(this),
      _add_obj: this.addObj.bind(this),
      _picture: this.picture.bind(this),

      _three_mesh_basic_material: this.threeMeshBasicMaterial.bind(this),
      _three_mesh_phong_material: this.threeMeshPhongMaterial.bind(this),
      _three_material_set: this.threeMaterialSet.bind(this),
      _three_point_light: this.threePointLight.bind(this),
      _three_set_position: this.threeSetPosition.bind(this),
      _three_set_rotation: this.threeSetRotation.bind(this),
      _three_mesh: this.threeMesh.bind(this)
    };

    this.wait = new Promise(r => (this.waitResolve = r));
    WebAssembly.instantiate(buffer, { env }).then(ret => {
      (this as any).instance = ret.instance;
      this.waitResolve();
    });

    this.assets = new Asset<string>(key => fetchModuleAsset(name, key));

    this.uint8 = new Uint8Array(this.memory.buffer);
  }

  /**
   * Wait until the current module is being loaded.
   * and then do a foreign call and let the module run its initial setup.
   */
  async init(): Promise<number> {
    await this.wait;
    this.waitResolve = undefined;
    this.wait = undefined;
    return this.instance.exports._init();
  }

  /**
   * Set the current component.
   */
  use(c: SlyeComponent): void {
    // We're switching the current component, so the execution of the
    // last WAsm function is over - just clear its memory.
    if (this.currentComponent) {
      this.currentComponent.mem.gc();
    }
    this.currentComponent = c;
    setTimeout(() => {
      c.mem.gc();
    });
  }

  // === PUBLIC INTERFACE ===
  // see Module for the docs.
  component(
    name: string,
    props: Record<string, PropValue> = {}
  ): SlyeComponent {
    const init = this.components.get(name);
    const c = new SlyeComponent(props);
    // Set a private value.
    (c as any).use = () => this.use(c);

    this.use(c);
    init();

    return c;
  }

  getFonts(): string[] {
    return [...this.fonts.keys()];
  }

  font(name: string): Font {
    return this.fonts.get(name);
  }
  // === END OF PUBLIC INTERFACE ===

  /**
   * Reads a zero-terminated ASCII string from the memory.
   *
   * @param {number} ptr Start offset of the string.
   * @returns {string}
   */
  private readChar(ptr: number): string {
    const start = ptr;
    while (this.uint8[++ptr]);
    const sub = this.uint8.subarray(start, ptr);
    return String.fromCharCode(...sub);
  }

  // === EXPORTED WASM FUNCTIONS ===

  private slog(msgPtr: number): void {
    console.log(`${this.name}:`, this.readChar(msgPtr));
  }

  /**
   * Register a new component.
   *
   * @param {char*} namePtr Name of the component.
   * @param {void cb()} cb Component's constructor function.
   * @returns {void}
   */
  private registerComponent(namePtr: number, cb: number): void {
    const name = this.readChar(namePtr);
    const init = this.table.get(cb);
    this.components.set(name, init);
  }

  /**
   * Load a local asset and returns a reference to it.
   *
   * @param {char*} namePtr Name of the asset. (e.g: homa.ttf)
   * @returns {asset_ref}
   */
  private loadLocal(namePtr: number): number {
    const name = this.readChar(namePtr);
    const id = this.assets.load(name);
    return id;
  }

  /**
   * Register a new font.
   *
   * @param {char*} namePtr Name of the font.
   * @param {asset_ref} assetRef Asset reference obtained by calling loadLocal.
   * @returns {void}
   */
  private registerFont(namePtr: number, assetRef: number): void {
    const name = this.readChar(namePtr);
    const fetch = () => this.assets.getData(assetRef);
    const font = new FontImpl(fetch, this.name, name);
    this.fonts.set(name, font);
  }

  /**
   * Set the render handler for the current component.
   *
   * @param {void cb(int frame)} Callback function.
   * @returns {void}
   */
  private onRender(cbPtr: number): void {
    const cb = this.table.get(cbPtr);
    this.currentComponent.setRenderHandler(cb);
  }

  /**
   * Sets the click handler for the current component, after that the component
   * will be added to the raycaster objects - so if there is really nothing
   * to do in a click event it's better to not call this function at all.
   *
   * @param {void cb()} Callback function.
   * @returns {void}
   */
  private onClick(cbPtr: number): void {
    const cb = this.table.get(cbPtr);
    this.currentComponent.setClickHandler(cb);
  }

  private newObj(): number {
    const ref = this.currentComponent.mem.store({});
    return ref;
  }

  private objSetString(objRef: number, keyPtr: number, strRef: number): void {
    const obj = this.currentComponent.mem.load(objRef);
    const key = this.readChar(keyPtr);
    const str = this.currentComponent.mem.load(strRef);
    obj[key] = str;
  }

  private objSetChar(objRef: number, keyPtr: number, strPtr: number): void {
    const obj = this.currentComponent.mem.load(objRef);
    const key = this.readChar(keyPtr);
    const str = this.readChar(strPtr);
    obj[key] = str;
  }

  private objSetNum(objRef: number, keyPtr: number, value: number): void {
    const obj = this.currentComponent.mem.load(objRef);
    const key = this.readChar(keyPtr);
    obj[key] = value;
  }

  private getStringPropRef(keyPtr: number): number {
    const key = this.readChar(keyPtr);
    const value = String(this.currentComponent.getProp(key));
    const ref = this.currentComponent.mem.store(value);
    return ref;
  }

  private getFontPropRef(keyPtr: number): number {
    const key = this.readChar(keyPtr);
    const value = this.currentComponent.getProp(key);
    if (!(value instanceof FontImpl)) return -1;
    const ref = this.currentComponent.mem.store(value);
    return ref;
  }

  private getABPropRef(keyPtr: number): number {
    const key = this.readChar(keyPtr);
    const ab = this.currentComponent.getProp(key);
    if (!(ab instanceof ArrayBuffer)) return -1;
    const id = this.assets.alloc(ab);
    return id;
  }

  private getProp(keyPtr: number): number {
    const key = this.readChar(keyPtr);
    const value = this.currentComponent.getProp(key);
    return Number(value);
  }

  private fontLayout(fontRef: number, textRef: number): number {
    const font = this.currentComponent.mem.load(fontRef);
    const value = this.currentComponent.mem.load(textRef);
    if (typeof value != "string") return -1;
    if (!(font instanceof FontImpl)) return -1;
    const layoutPromise = font.layout(value);
    const ref = this.currentComponent.mem.store(layoutPromise);
    return ref;
  }

  private generateTextGeometry(
    layoutRef: number,
    size: number,
    steps: number,
    depth: number,
    bevelEnabled: boolean,
    bevelThickness: number,
    bevelSize: number,
    bevelSegments: number
  ): number {
    const layoutPromise: Promise<Glyph[]> = this.currentComponent.mem.load(
      layoutRef
    );
    const value = new Promise((resolve, reject) => {
      layoutPromise
        .then(layout => {
          try {
            const shape = generateShapes(layout, size);
            const geometry = new THREE.ExtrudeGeometry(shape, {
              steps,
              depth,
              bevelEnabled,
              bevelThickness,
              bevelSize,
              bevelSegments
            });
            resolve(geometry);
          } catch (e) {
            reject(e);
          }
        })
        .catch(reject);
    });
    const ref = this.currentComponent.mem.store(value);
    return ref;
  }

  private addObj(objRef: number): void {
    const currentComponent = this.currentComponent;
    const promise = currentComponent.mem.load(objRef);
    (async () => {
      const obj = await promise;
      currentComponent.group.add(obj);
    })();
  }

  // === Three.JS API ===

  private threeMeshBasicMaterial(props: number): number {
    const obj = this.currentComponent.mem.load(props);
    const material = new THREE.MeshBasicMaterial(obj);
    const ref = this.currentComponent.mem.store(material);
    return ref;
  }

  private threeMeshPhongMaterial(props: number): number {
    const obj = this.currentComponent.mem.load(props);
    const material = new THREE.MeshPhongMaterial(obj);
    const ref = this.currentComponent.mem.store(material);
    return ref;
  }

  private threeMaterialSet(ref: number, keyPtr: number, value: number): void {
    const material = this.currentComponent.mem.load(ref);
    const key = this.readChar(keyPtr);
    material[key] = value;
  }

  private threePointLight(
    color: number,
    intensity: number,
    distance: number
  ): number {
    const light = new THREE.PointLight(color, intensity, distance);
    const ref = this.currentComponent.mem.store(light);
    return ref;
  }

  private threeSetPosition(o: number, x: number, y: number, z: number): void {
    const obj = this.currentComponent.mem.load(o);
    obj.position.set(x, y, z);
  }

  private threeSetRotation(o: number, x: number, y: number, z: number): void {
    const obj = this.currentComponent.mem.load(o);
    obj.rotation.set(x, y, z);
  }

  private threeMesh(geoRef: number, materialRef: number): number {
    const geoPromise = this.currentComponent.mem.load(geoRef);
    const materialPromise = this.currentComponent.mem.load(materialRef);

    const value = new Promise(async (resolve, reject) => {
      const geo = await geoPromise;
      const material = await materialPromise;
      const val = new THREE.Mesh(geo, material);
      resolve(val);
    });
    const ref = this.currentComponent.mem.store(value);
    return ref;
  }

  private picture(assetRef: number, width: number, height: number): number {
    const abPromise = this.assets.getData(assetRef);

    const value = new Promise((resolve, reject) => {
      abPromise
        .then(ab => {
          const texture = new THREE.Texture();
          texture.generateMipmaps = false;
          texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.minFilter = THREE.LinearFilter;

          const imageBlob = new Blob([ab], { type: "image/png" });
          const url = URL.createObjectURL(imageBlob);

          const image = new Image();
          image.src = url;
          image.onload = () => {
            texture.image = image;
            texture.needsUpdate = true;
          };

          const geometry = new THREE.PlaneBufferGeometry(width, height, 32);
          const material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: texture
          });

          const plane = new THREE.Mesh(geometry, material);

          resolve(plane);
        })
        .catch(reject);
    });

    const ref = this.currentComponent.mem.store(value);
    return ref;
  }
}

/**
 * Load the given module, it uses server API to load module by its name.
 *
 * @param {string} name Name of the module.
 * @returns {Promise<Module>}
 */

export async function loadModule(name: string): Promise<Module> {
  if (modulesTable.has(name)) return modulesTable.get(name);

  const buf = await fetchWAsm(name);
  const wasm = new ModuleImpl(buf, name);
  await wasm.init();

  modulesTable.set(name, wasm);
  return wasm;
}

/**
 * Returns a new instance of the component.
 *
 * @param {string} moduleName Name of the module which provides this component.
 * @param {string} componentName Name of the component.
 * @param {Record<string, PropValue>} props Properties for this instance.
 * @returns {Promise<Component>}
 */
export async function component(
  moduleName: string,
  componentName: string,
  props: Record<string, PropValue> = {}
): Promise<Component> {
  const m = await loadModule(moduleName);
  return m.component(componentName, props);
}

/**
 * Returns a font from the given module.
 *
 * @param {string} moduleName Module which owns the font.
 * @param {string} fontName Name of the font.
 * @returns {Promise<Font>}
 */
export async function font(
  moduleName: string,
  fontName: string
): Promise<Font> {
  const m = await loadModule(moduleName);
  return m.font(fontName);
}
