/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Shape, ShapePath } from "three";
import { Glyph, PathCommand } from "./base";

/**
 * Create a Three.js Shape from the given text layout.
 *
 * @param glyphs Set of glyphs. (Obtained by calling font.layout)
 * @param size Font size.
 */
export function generateShapes(glyphs: Glyph[], size = 25): Shape[] {
  const shapes: Shape[] = [];
  const paths = createPaths(glyphs, size);

  for (const p of paths) {
    Array.prototype.push.apply(shapes, p.toShapes(false, false));
  }

  return shapes;
}

function createPaths(glyphs: Glyph[], size: number): ShapePath[] {
  const paths: ShapePath[] = [];
  let offsetX = 0;
  let offsetY = 0;

  for (const g of glyphs) {
    const ret = createPath(g, size, offsetX, offsetY);
    offsetX += ret.offsetX;
    paths.push(ret.path);
    // TODO(qti3e) Line break.
    // Maybe we should move this `offsetX += ` logic to font.layout.
  }

  return paths;
}

interface CreatePathResult {
  path: ShapePath;
  offsetX: number;
}

function createPath(
  g: Glyph,
  size: number,
  offsetX: number,
  offsetY: number
): CreatePathResult {
  const path = new ShapePath();

  for (const u of g.path) {
    switch (u.command) {
      case PathCommand.MOVE_TO:
        u.x = u.x * size + offsetX;
        u.y = u.y * size + offsetY;
        path.moveTo(u.x, u.y);
        break;
      case PathCommand.LINE_TO:
        u.x = u.x * size + offsetX;
        u.y = u.y * size + offsetY;
        path.lineTo(u.x, u.y);
        break;
      case PathCommand.QUADRATIC_CURVE_TO:
        u.cpx = u.cpx * size + offsetX;
        u.cpy = u.cpy * size + offsetY;
        u.x = u.x * size + offsetX;
        u.y = u.y * size + offsetY;
        path.quadraticCurveTo(u.cpx, u.cpy, u.x, u.y);
        break;
      case PathCommand.BEZIER_CURVE_TO:
        u.cpx1 = u.cpx1 * size + offsetX;
        u.cpy1 = u.cpx1 * size + offsetY;
        u.cpx2 = u.cpx2 * size + offsetX;
        u.cpy2 = u.cpy2 * size + offsetY;
        u.x = u.x * size + offsetX;
        u.y = u.y * size + offsetY;
        path.bezierCurveTo(u.cpx1, u.cpy1, u.cpx2, u.cpy2, u.x, u.y);
        break;
    }
  }

  return { offsetX: g.advanceWidth * size, path };
}
