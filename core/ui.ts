/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Font } from "./font";
import { Component, PropValue } from "./component";

// UI widgets
const e = eval;
const g: any = e("this");
export const TEXT: unique symbol = g.swT || (g.swT = Symbol());
export const SIZE: unique symbol = g.swS || (g.swS = Symbol());
export const FONT: unique symbol = g.swF || (g.swF = Symbol());

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
  [FONT]: Widget<Font, T>;
}

type BindingTypeMap<T> = T extends string
  ? (typeof TEXT)
  : T extends number
  ? (typeof SIZE)
  : T extends Font
  ? (typeof FONT)
  : never;

export type Widgets<Props> = {
  [K in keyof Props]: BindingTypeMap<Props[K]>
} & {
  _order?: (keyof Props)[];
};
