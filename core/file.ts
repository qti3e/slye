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
import { fetchAsset, fetchModuleAsset } from "./server";

export class File implements FileBase {
  /**
   * Used for optimizations.
   */
  readonly isSlyeFile = true;

  /**
   * Fetched data.
   */
  private cache: ArrayBuffer;

  private urlCache: string;

  private blobURL: string;

  constructor(
    readonly owner: string,
    readonly uuid: string,
    readonly isModuleAsset: boolean
  ) {}

  /**
   * Fetch the file from the server.
   *
   * @returns {Promise<ArrayBuffer>}
   */
  async load(): Promise<ArrayBuffer> {
    if (this.cache) return this.cache;
    const fetch = this.isModuleAsset ? fetchModuleAsset : fetchAsset;
    const ab = await fetch(this.owner, this.uuid);
    this.cache = ab;
    return ab;
  }

  async url(): Promise<string> {
    if (this.blobURL) return this.blobURL;
    const ab = await this.load();
    const blob = new Blob([ab]);
    const url = URL.createObjectURL(blob);
    this.blobURL = url;
    return url;
  }
}
