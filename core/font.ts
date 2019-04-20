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
import { Module } from "./module";

export enum PathCommand {
  MOVE_TO,
  LINE_TO,
  QUADRATIC_CURVE_TO,
  BEZIER_CURVE_TO
}

export interface MoveToCommand {
  command: PathCommand.MOVE_TO;
  x: number;
  y: number;
}

export interface LineToCommand {
  command: PathCommand.LINE_TO;
  x: number;
  y: number;
}

export interface QuadraticCurveToCommand {
  command: PathCommand.QUADRATIC_CURVE_TO;
  x: number;
  y: number;
  cpx: number;
  cpy: number;
}

export interface BezierCurveTo {
  command: PathCommand.BEZIER_CURVE_TO;
  x: number;
  y: number;
  cpx1: number;
  cpy1: number;
  cpx2: number;
  cpy2: number;
}

export type PathUnit =
  | MoveToCommand
  | LineToCommand
  | QuadraticCurveToCommand
  | BezierCurveTo;

export type Path = PathUnit[];

export interface Glyph {
  path: Path;
  advanceWidth: number;
}

export interface Font {
  layout(text: string): Promise<Glyph[]>;
}

export class FontImpl implements Font {
  private font: fontkit.Font;

  constructor(private readonly fetch: () => Promise<ArrayBuffer>) {}

  private async ensure(): Promise<void> {
    if (this.font) return;
    const data = await this.fetch();
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
      const path: PathUnit[] = [];

      let sx, sy;
      let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2;

      for (let j = 0; j < glyph.path.commands.length; ++j) {
        const { command, args } = glyph.path.commands[j];
        switch (command) {
          case "moveTo":
            x = args[0] * scale;
            y = args[1] * scale;
            path.push({
              command: PathCommand.MOVE_TO,
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
              command: PathCommand.LINE_TO,
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
              command: PathCommand.QUADRATIC_CURVE_TO,
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
              command: PathCommand.BEZIER_CURVE_TO,
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
              command: PathCommand.LINE_TO,
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
