/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

type PresentationUUID = string;
type ModuleName = string;

/**
 * File represents a presentation file, like a picture or a video.
 */
export interface FileBase {
  /**
   * Used for optimizations, you should never change this.
   */
  readonly isSlyeFile: true;

  /**
   * Whatever this file is a presentation file or a module asset.
   */
  readonly isModuleAsset: boolean;

  /**
   * Unique id for this file.
   */
  readonly uuid: string;

  /**
   * File provider.
   * If the file is a module asset it points to a module otherwise it's the
   * presentation id.
   */
  readonly owner: PresentationUUID | ModuleName;

  /**
   * Fetch the file from the server.
   *
   * @returns {Promise<ArrayBuffer>}
   */
  load(): Promise<ArrayBuffer>;

  /**
   * Returns a file URL. (Object URL)
   *
   * @returns {Promise<string>}
   */
  url(): Promise<string>;
}
