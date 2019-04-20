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

export interface Module {
  component(name: string, props: Record<string, PropValue>): Component;
  getFonts(): string[];
  font(name: string): Font;
}

export class ModuleImpl implements Module {
  private readonly components: Map<string, ComponentInit> = new Map();
  private readonly fonts: Map<string, Font> = new Map();
  private readonly assets: Asset<string>;

  private readonly memory: WebAssembly.Memory;
  private readonly table: WebAssembly.Table;
  private readonly instance: WebAssembly.Instance;

  private wait: Promise<void>;
  private waitResolve: () => void;

  private currentComponent: SlyeComponent;

  private readonly uint8: Uint8Array;

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
      // Callables.
      abort() {},
      _register_component: this.registerComponent.bind(this),
      _slog: this.slog.bind(this),
      _load_local: this.loadLocal.bind(this),
      _register_font: this.registerFont.bind(this),

      // For components.
      _on_render: this.onRender.bind(this),
      _on_click: this.onClick.bind(this)
    };

    this.wait = new Promise(r => (this.waitResolve = r));
    WebAssembly.instantiate(buffer, { env }).then(ret => {
      (this as any).instance = ret.instance;
      this.waitResolve();
    });

    this.assets = new Asset<string>(key => fetchModuleAsset(name, key));

    this.uint8 = new Uint8Array(this.memory.buffer);
  }

  async init(): Promise<number> {
    await this.wait;
    this.waitResolve = undefined;
    this.wait = undefined;
    return this.instance.exports._init();
  }

  use(c: SlyeComponent): void {
    // We're switching the current component, so the execution of the
    // last wasm function is over - just clear its memory.
    if (this.currentComponent) {
      this.currentComponent.mem.gc();
    }
    this.currentComponent = c;
  }

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

  private readChar(ptr: number): string {
    const start = ptr;
    while (this.uint8[++ptr]);
    const sub = this.uint8.subarray(start, ptr);
    return String.fromCharCode(...sub);
  }

  // === EXPORTED WASM FUNCTIONS ===

  private slog(msgPtr: number): void {
    console.log("wasm-log:", this.readChar(msgPtr));
  }

  private registerComponent(namePtr: number, cb: number): void {
    const name = this.readChar(namePtr);
    const init = this.table.get(cb);
    this.components.set(name, init);
  }

  private loadLocal(namePtr: number): number {
    const name = this.readChar(namePtr);
    const id = this.assets.load(name);
    return id;
  }

  private registerFont(namePtr: number, assetRef: number): void {
    const name = this.readChar(namePtr);
    const fetch = () => this.assets.getData(assetRef);
    const font = new FontImpl(fetch, this.name, name);
    this.fonts.set(name, font);
  }

  private onRender(cbPtr: number): void {
    const cb = this.table.get(cbPtr);
    this.currentComponent.setRenderHandler(cb);
  }

  private onClick(cbPtr: number): void {
    const cb = this.table.get(cbPtr);
    this.currentComponent.setClickHandler(cb);
  }

  // === Three.js API ===

  private threeMeshBasicMaterial(color: number): number {
    const material = new THREE.MeshBasicMaterial({
      color
    });
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

  private getPop(keyPtr: number): number {
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
            const shape = generateShapes(layout);
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

  private threeMesh(geoRef: number, materialRef: number): number {
    const value = new Promise(async (resolve, reject) => {
      const geo = await this.currentComponent.mem.load(geoRef);
      const material = await this.currentComponent.mem.load(materialRef);
      const val = new THREE.Mesh(geo, material);
      resolve(val);
    });
    const ref = this.currentComponent.mem.store(value);
    return ref;
  }

  private addObj(objRef: number): void {
    (async () => {
      const obj = await this.currentComponent.mem.load(objRef);
      this.currentComponent.group.add(obj);
    })();
  }
}

/**
 * Loads a wasm file and register it as a module.
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
 * Create a component from a module.
 */
export async function component(
  moduleName: string,
  componentName: string,
  props: Record<string, PropValue> = {}
): Promise<Component> {
  const m = await loadModule(moduleName);
  return m.component(componentName, props);
}

export async function font(
  moduleName: string,
  fontName: string
): Promise<Font> {
  const m = await loadModule(moduleName);
  return m.font(fontName);
}
