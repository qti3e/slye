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
 * File represents a presentation file, like a picture or a video.
 */
export interface FileBase {
  /**
   * Unique id for this file.
   */
  readonly uuid: string;

  /**
   * Used for optimizations, you should never change this.
   */
  readonly isSlyeFile: true;

  /**
   * Each file belongs to only one presentation at a time and
   * it can not be moved from one presentation into another.
   */
  readonly presentationId: string;

  /**
   * Fetch the file from the server.
   *
   * @returns {Promise<ArrayBuffer>}
   */
  load(): Promise<ArrayBuffer>;
}
