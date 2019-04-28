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
import { Glyph, Font, FontImpl } from "./font";
import {
  Component,
  ComponentInit,
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

export function registerModule(name: string, m: Module): void {
  modulesTable.set(name, m);
}

/**
 * Load the given module, it uses server API to load module by its name.
 *
 * @param {string} name Name of the module.
 * @returns {Promise<Module>}
 */
export async function loadModule(name: string): Promise<Module> {
  if (modulesTable.has(name)) {
    return modulesTable.get(name);
  }
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
