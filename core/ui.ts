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

type Widget<T, R> = (value: T, onUpdate: OnUpdate<T>) => R;
type ValueType<T> = T extends (v: infer R, u: OnUpdate<infer R>) => void
  ? R
  : never;

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

// Exposed API.
export function render<T, S extends keyof Binding>(
  binding: Binding<T>,
  sym: S,
  init: ValueType<Binding[S]>,
  onUpdate: OnUpdate<ValueType<Binding[S]>>
): T {
  return (binding[sym] as any)(init, onUpdate);
}

interface RenderComponentResult<T> {
  reset: () => void;
  elements: T[];
}

export function renderComponentProps<T, P>(
  binding: Binding<T>,
  component: Component<P>
): RenderComponentResult<T> {
  const ui = component.ui;
  if (!ui) return null;

  const elements: T[] = [];
  const propKeys: (keyof P)[] = ui._order
    ? [...ui._order]
    : (Object.keys(ui) as any);

  const initValues: Partial<P> = {};

  for (const key of propKeys) {
    initValues[key] = component.getProp(key);

    const onUpdate: OnUpdate<P[typeof key]> = (value: P[typeof key]) => {
      component.setProp(key, value);
    };

    const element = render(
      binding,
      ui[key],
      initValues[key] as any,
      onUpdate as any
    );

    elements.push(element);
  }

  // Reset props.
  const reset = (): void => void component.patchProps(initValues);

  return {
    elements,
    reset
  };
}
