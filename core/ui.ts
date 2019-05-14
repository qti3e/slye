/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { FontBase, PropValue } from "./interfaces";

// UI widgets
const e = eval;
const g: any = e("this");
export const TEXT: unique symbol = g.swT || (g.swT = Symbol("TEXT"));
export const SIZE: unique symbol = g.swS || (g.swS = Symbol("SIZE"));
export const FONT: unique symbol = g.swF || (g.swF = Symbol("FONT"));
export const COLOR: unique symbol = g.swC || (g.swC = Symbol("COLOR"));

// Types
export type OnUpdate<T> = (value: T) => void;

export interface WidgetProps<T> {
  value: T;
  onUpdate: OnUpdate<T>;
}

type Widget<T, R> = (props: WidgetProps<T>) => R;

export interface Binding<T = unknown> {
  [TEXT]: Widget<string, T>;
  [SIZE]: Widget<number, T>;
  [FONT]: Widget<FontBase, T>;
  [COLOR]: Widget<number, T>;
}

type BindingTypeMap<T> = T extends string
  ? (typeof TEXT)
  : T extends number
  ? (typeof SIZE | typeof COLOR)
  : T extends FontBase
  ? (typeof FONT)
  : never;

export type Widgets<Props> = {
  [K in keyof Props]: BindingTypeMap<Props[K]>
} & {
  _order?: (keyof Props)[];
};
