/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

export type Path = PathCommand[];

export enum PathCommandKind {
  MOVE_TO,
  LINE_TO,
  QUADRATIC_CURVE_TO,
  BEZIER_CURVE_TO
}

export type PathCommand =
  | MoveToCommand
  | LineToCommand
  | QuadraticCurveToCommand
  | BezierCurveToCommand;

export interface MoveToCommand {
  command: PathCommandKind.MOVE_TO;
  x: number;
  y: number;
}

export interface LineToCommand {
  command: PathCommandKind.LINE_TO;
  x: number;
  y: number;
}

export interface QuadraticCurveToCommand {
  command: PathCommandKind.QUADRATIC_CURVE_TO;
  x: number;
  y: number;
  cpx: number;
  cpy: number;
}

export interface BezierCurveToCommand {
  command: PathCommandKind.BEZIER_CURVE_TO;
  x: number;
  y: number;
  cpx1: number;
  cpy1: number;
  cpx2: number;
  cpy2: number;
}
