/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Path } from "./path";

/**
 * Slye fonts are objects that we can use as font files in
 * the rendering phase.
 */
export interface FontBase {
  /**
   * Used for optimizations, you should never change this.
   */
  readonly isSlyeFont: true;

  /**
   * Name of the provider module.
   */
  readonly moduleName: string;

  /**
   * Name of this font.
   */
  readonly name: string;

  /**
   * Render a text and return an array of Glyphs.
   * This function is asynchronous as it might need to fetch the actual font
   * file from the server.
   *
   * @param {string} text The text which you want to render.
   * @returns {Promise<Glyph[]>}
   */
  layout(text: string): Promise<Glyph[]>;
}

/**
 * Each Glyph is a Path and amount of width it'll consume.
 */
export interface Glyph {
  path: Path;
  advanceWidth: number;
}
