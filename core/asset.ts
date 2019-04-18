/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

export type AssetFetchFunction<T> = (key: T) => Promise<ArrayBuffer>;

/**
 * To store assets for either presentation or a module.
 *
 * For every asset we make a numeric ID so that we can
 * easily use it with WAsm.
 */
export class Asset<Key = string> {
  /**
   * Data which is already fetched.
   */
  private readonly data: Map<number, ArrayBuffer> = new Map();

  /**
   * Map asset keys to their id.
   */
  private readonly key2id: Map<Key, number> = new Map();

  /**
   * Asset Id -> Key
   */
  private readonly id2key: Map<number, Key> = new Map();

  /**
   * Last Used Id.
   */
  private last_id = 0;

  /**
   * @param fetch Callback function that should be called when
   * an asset has to be loaded.
   */
  constructor(private readonly fetch: AssetFetchFunction<Key>) {}

  /**
   * Load an asset - it does not actually fetch the asset.
   */
  load(key: Key): number {
    if (this.key2id.has(key)) return this.key2id.get(key);
    let id = this.last_id++;
    this.key2id.set(key, id);
    this.id2key.set(id, key);
    return id;
  }

  /**
   * Return the arraybuffer.
   */
  async getData(index: number): Promise<ArrayBuffer> {
    if (this.data.has(index)) return this.data.get(index);
    const key = this.id2key.get(index);
    const data = await this.fetch(key);
    this.data.set(index, data);
    return data;
  }
}
