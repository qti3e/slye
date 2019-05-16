/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { FileBase } from "./interfaces";
import { fetchAsset } from "./server";

/**
 * Presentation File Asset.
 */
export class File implements FileBase {
  /**
   * Used for optimizations.
   */
  readonly isSlyeFile = true;

  /**
   * Fetched data.
   */
  private cache: ArrayBuffer;

  constructor(readonly presentationId: string, readonly uuid: string) {}

  /**
   * Fetch the file from the server.
   *
   * @returns {Promise<ArrayBuffer>}
   */
  async load(): Promise<ArrayBuffer> {
    if (this.cache) return this.cache;
    const ab = await fetchAsset(this.presentationId, this.uuid);
    this.cache = ab;
    return ab;
  }
}
