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

type OnUpdate<T> = (value: T) => void;

type Widget<T, R> = (value: T, onUpdate: OnUpdate<T>) => R;
type ValueType<T> = T extends (v: infer R, u: OnUpdate<infer R>) => any
  ? R
  : never;

// UI widgets
export const TEXT: unique symbol = Symbol();
export const SIZE: unique symbol = Symbol();
export const FONT: unique symbol = Symbol();

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

export function render<T, S extends keyof Binding>(
  binding: Binding<T>,
  sym: S,
  init: ValueType<Binding[S]>,
  onUpdate: OnUpdate<ValueType<Binding[S]>>
): T {
  return null;
}
