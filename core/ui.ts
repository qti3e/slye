/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

type OnUpdate<T> = (value: T) => void;

export type Widget<T> = (value: T, onUpdate: OnUpdate<T>) => HTMLElement;

export const textWidget: Widget<string> = function(
  value: string,
  update: OnUpdate<string>
) {
  return null;
};

export const sizeWidget: Widget<number> = function(
  value: number,
  update: OnUpdate<number>
) {
  return null;
};
