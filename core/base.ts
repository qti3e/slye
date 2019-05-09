/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Vec3 } from "./math";
import { PropValue } from "./component";

// Base interfaces for a presentation raw data structure.
// A headless presentation (without WebGL) is an
// implementation of the following types.

export interface PresentationBase {
  readonly uuid: string;
  steps: StepBase[];
  del(step: StepBase): void;
  add(step: StepBase, index?: number): void;
  getStepId(step: StepBase): number;
}

export interface Transformable {
  setPosition(x: number, y: number, z: number): void;
  setRotation(x: number, y: number, z: number): void;
  setScale(x: number, y: number, z: number): void;
  getPosition(): Vec3;
  getRotation(): Vec3;
  getScale(): Vec3;
}

export interface StepBase extends Transformable {
  readonly uuid: string;
  owner: PresentationBase;
  components: ComponentBase[];
  del(component: ComponentBase): void;
  add(component: ComponentBase): void;
}

export interface ComponentBase extends Transformable {
  readonly uuid: string;
  owner: StepBase;
  props: Record<any, PropValue>;
  getProp(key: any): PropValue;
  patchProps(props: Record<any, PropValue>): void;
}

export interface FontBase {
  readonly moduleName: string;
  readonly name: string;
  layout(text: string): Promise<Glyph[]>;
}

// Types used in a font.
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
