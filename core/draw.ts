/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

export enum CommandKind {
  MOVE_TO,
  LINE_TO,
  QUADRATIC_CURVE_TO,
  BEZIER_CURVE_TO
}

interface PathCommand {
  command: CommandKind;
  args: number[];
}

export interface Drawable {
  path: PathCommand[];
}
