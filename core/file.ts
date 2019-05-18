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
import { fetchAsset, getAssetURL } from "./server";

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

  private urlCache: string;

  private blobURL: string;

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

  async url(): Promise<string> {
    if (this.blobURL) return this.blobURL;
    const ab = await this.load();
    const blob = new Blob([ab]);
    //const blob = new Blob([ab], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    this.blobURL = url;
    return url;
  }

  async streamURL(): Promise<string> {
    if (this.urlCache) return this.urlCache;
    const url = await getAssetURL(this.presentationId, this.uuid);
    this.urlCache = url;
    return url;
  }
}
