/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import * as fontkit from "fontkit";
import { FontBase, Glyph, PathCommandKind, PathCommand } from "../interfaces";
import { File } from "../file";

export class Font implements FontBase {
  readonly isSlyeFont = true;
  private font: fontkit.Font;

  constructor(readonly name: string, readonly file: File) {}

  private async ensure(): Promise<void> {
    if (this.font) return;
    const data = await this.file.load();
    const buffer = new Buffer(data); // WTF! I don't like Buffer.
    this.font = fontkit.create(buffer);
  }

  /**
   * Return a simplified & reusable font layout.
   *
   * @param text Unicode text we want to render.
   */
  async layout(text: string): Promise<Glyph[]> {
    await this.ensure();

    const ret: Glyph[] = [];
    const { glyphs } = this.font.layout(text);
    const scale = 1 / this.font.head.unitsPerEm;

    for (let i = 0; i < glyphs.length; ++i) {
      const glyph = glyphs[i];
      const path: PathCommand[] = [];

      let sx, sy;
      let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2;

      for (let j = 0; j < glyph.path.commands.length; ++j) {
        const { command, args } = glyph.path.commands[j];
        switch (command) {
          case "moveTo":
            x = args[0] * scale;
            y = args[1] * scale;
            path.push({
              command: PathCommandKind.MOVE_TO,
              x,
              y
            });
            if (sx === undefined) {
              sx = x;
              sy = y;
            }
            break;
          case "lineTo":
            x = args[0] * scale;
            y = args[1] * scale;
            path.push({
              command: PathCommandKind.LINE_TO,
              x,
              y
            });
            break;
          case "quadraticCurveTo":
            cpx = args[0] * scale;
            cpy = args[1] * scale;
            x = args[2] * scale;
            y = args[3] * scale;
            path.push({
              command: PathCommandKind.QUADRATIC_CURVE_TO,
              cpx,
              cpy,
              x,
              y
            });
            break;
          case "bezierCurveTo":
            cpx1 = args[0] * scale;
            cpy1 = args[1] * scale;
            cpx2 = args[2] * scale;
            cpy2 = args[3] * scale;
            x = args[4] * scale;
            y = args[5] * scale;
            path.push({
              command: PathCommandKind.BEZIER_CURVE_TO,
              cpx1,
              cpy1,
              cpx2,
              cpy2,
              x,
              y
            });
            break;
          case "closePath":
            path.push({
              command: PathCommandKind.LINE_TO,
              x: sx,
              y: sy
            });
            sx = sy = undefined;
            break;
        }
      }

      ret.push({
        path,
        advanceWidth: glyph.advanceWidth * scale
      });
    }

    return ret;
  }
}
