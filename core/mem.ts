/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

/**
 * This kind of memory is used to store data such as
 * a material, a mash or...
 */
export class Mem {
  /**
   * Internal table to store data.
   * It maps refrences to values.
   */
  private readonly table: Map<number, unknown> = new Map();

  /**
   * Last refrence.
   */
  private lastId = 0;

  /**
   * Clear table.
   */
  gc(): void {
    this.table.clear();
    this.lastId = 0;
  }

  /**
   * Store data to the table.
   */
  store(value: unknown): number {
    const id = this.lastId++;
    this.table.set(id, value);
    return id;
  }

  /**
   * Load value from memory.
   */
  load(id: number): any {
    return this.table.get(id);
  }
}
