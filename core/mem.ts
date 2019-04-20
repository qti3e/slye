/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

const table: Map<number, unknown> = new Map();
const gcTable: Map<number, number> = new Map();

const freedIds: number[] = [];
let lastId = 0;

export function addValue(data: unknown): number {
  const id = freedIds.pop() || lastId++;
  table.set(id, data);
  gcTable.set(id, 1);
  return id;
}

export function getValue(id: number): any {
  if (id == -1) return undefined;
  return table.get(id);
}

export function retain(id: number): void {
  if (id == -1) return;
  gcTable.set(id, gcTable.get(id) + 1);
}

export function release(id: number): void {
  if (id == -1) return;
  const value = gcTable.get(id);
  if (value === 1) {
    gcTable.delete(id);
    table.delete(id);
    freedIds.push(id);
  } else {
    gcTable.set(id, value - 1);
  }
}
