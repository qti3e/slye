/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { generateShapes } from "./draw";
import { FontBase, PropValue, ComponentProps } from "./interfaces";
import { Asset } from "./asset";
import { fetchModuleAsset, requestModule } from "./server";
import { ThreeComponent, Font } from "./three";
import uuidv1 from "uuid/v1";

const modulesTable: Map<string, ModuleInterface> = (window.slyeModulesTable =
  window.slyeModulesTable || new Map());

/**
 * A module is a Slye extension that might provide a set of components, fonts,
 * template or other functionalities.
 */
export interface ModuleInterface {
  /**
   * Name of the module.
   */
  readonly name: string;

  /**
   * Asset manager for the module.
   */
  readonly assets: Asset<string>;

  /**
   * Returns a new instance of the component.
   *
   * @param {string} name Name of the component.
   * @param {Record<string, PropValue>} props Properties.
   * @returns {Component}
   */
  component(
    name: string,
    props: Record<string, PropValue>,
    id?: string
  ): ThreeComponent<any>;

  /**
   * Returns name of the registered fonts.
   *
   * @returns {string[]}
   */
  getFonts(): string[];

  /**
   * Returns a font instance which is associated with the given name.
   * @param {string} name Name of the font.
   * @returns {FontBase}
   */
  font(name: string): FontBase;

  /**
   * Initialize the module.
   * @returns {void}
   */
  init(): void;
}

type ComponentClass = {
  new (
    uuid: string,
    moduleName: string,
    componentName: string,
    props: ComponentProps
  ): ThreeComponent<ComponentProps>;
};

type ModuleClass = {
  new (name: string): ModuleInterface;
};

export abstract class Module implements ModuleInterface {
  private readonly components: Map<string, ComponentClass> = new Map();
  private readonly fonts: Map<string, FontBase> = new Map();
  readonly assets: Asset<string>;
  readonly name: string;

  constructor(name: string) {
    this.name = name;
    this.assets = new Asset(key => fetchModuleAsset(name, key));
  }

  protected registerComponent(name: string, c: ComponentClass): void {
    this.components.set(name, c);
  }

  protected registerFont(name: string, asset: number): void {
    const font = new Font(() => this.assets.getData(asset), this.name, name);
    this.fonts.set(name, font);
  }

  component(
    name: string,
    props: Record<string, PropValue>,
    id = uuidv1()
  ): ThreeComponent<any> {
    const c = this.components.get(name);
    if (!c)
      throw new Error(`Component ${name} is not registered by ${this.name}.`);
    return new c(id, this.name, name, props);
  }

  getFonts(): string[] {
    return [...this.fonts.keys()];
  }

  font(name: string): FontBase {
    return this.fonts.get(name);
  }

  abstract init(): Promise<void> | void;
}

export function registerModule(name: string, m: ModuleClass): void {
  const instance = new m(name);
  instance.init();
  modulesTable.set(name, instance);
}

/**
 * Load the given module, it uses server API to load module by its name.
 *
 * @param {string} name Name of the module.
 * @returns {Promise<ModuleInterface>}
 */
export async function loadModule(name: string): Promise<ModuleInterface> {
  if (modulesTable.has(name)) {
    return modulesTable.get(name);
  }
  await requestModule(name);
  return modulesTable.get(name);
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
  props: Record<string, PropValue> = {},
  id = uuidv1()
): Promise<ThreeComponent<any>> {
  const m = await loadModule(moduleName);
  return m.component(componentName, props, id);
}

/**
 * Returns a font from the given module.
 *
 * @param {string} moduleName Module which owns the font.
 * @param {string} fontName Name of the font.
 * @returns {Promise<FontBase>}
 */
export async function font(
  moduleName: string,
  fontName: string
): Promise<FontBase> {
  const m = await loadModule(moduleName);
  return m.font(fontName);
}
