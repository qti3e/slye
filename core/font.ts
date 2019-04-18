/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Drawable } from "./draw";

/**
 * SlyeText represent a styled text, when a raw string
 * is given it treats it as a styled text which all the
 * flags being set to false.
 */
export type SlyeText = string | SlyeStyledText;

/**
 * SlyeStyledText is to be used to represent a text which has
 * styles such as Bold, Italic, etc.. on it.
 */
export type SlyeStyledText = (string | SlyeStyledTextPart)[];

/**
 * SlyeStyledTextPart is to store each part of a text
 * with its styles.
 */
export interface SlyeStyledTextPart {
  bold?: boolean;
  itlic?: boolean;
  underlined?: boolean;
  overlined?: boolean;
  text: string;
}

/**
 * Any instance of `Font` represents a font file which is already
 * loaded into the memory.
 *
 * It provides a API to convert a simple string or a styled text into a drawable
 * object which can later be used to draw the text into the 3D canvas.
 */
export class Font {
  /**
   * Convert the given text into a drawable object.
   */
  renderText(text: SlyeText): Drawable {
    return null;
  }
}
