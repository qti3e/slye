/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { FileBase, FontBase, PropValue, ComponentProps } from "./interfaces";

// UI widgets
const e = eval;
const g: any = e("this");
export const TEXT: unique symbol = g.swT || (g.swT = Symbol("TEXT"));
export const SIZE: unique symbol = g.swS || (g.swS = Symbol("SIZE"));
export const FONT: unique symbol = g.swF || (g.swF = Symbol("FONT"));
export const COLOR: unique symbol = g.swC || (g.swC = Symbol("COLOR"));
export const FILE: unique symbol = g.swI || (g.swI = Symbol("FILE"));

type WidgetTypeMap<T> = T extends string
  ? (typeof TEXT)
  : T extends number
  ? (typeof SIZE | typeof COLOR)
  : T extends FontBase
  ? (typeof FONT)
  : T extends FileBase
  ? (typeof FILE)
  : never;

export type Widget<Props> = {
  [K in keyof Props]: {
    name: K;
    widget: WidgetTypeMap<Props[K]>;
    size: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "auto";
  }
}[keyof Props];

export type UILayout<Props> = Widget<Props>[];
