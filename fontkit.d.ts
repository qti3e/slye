/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

declare module "fontkit" {
  interface PathCommand {
    command:
      | "moveTo"
      | "lineTo"
      | "quadraticCurveTo"
      | "bezierCurveTo"
      | "closePath";
    args: number[];
  }

  interface Path {
    commands: PathCommand[];
  }

  interface Glyph {
    id: number;
    codePoints: number[];
    path: Path;
    advanceWidth: number;
  }

  interface GlyphRun {
    glyphs: Glyph[];
  }

  interface Font {
    postscriptName: string;
    fullName: string;
    familyName: string;
    subfamilyName: string;
    copyright: string;
    version: string;
    head: {
      unitsPerEm: number;
    };
    layout(text: string): GlyphRun;
  }

  function create(buffer: ArrayBuffer): Font;
}
