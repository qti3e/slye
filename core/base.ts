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
  owner: PresentationBase;
  components: ComponentBase[];
  del(component: ComponentBase): void;
  add(component: ComponentBase): void;
}

export interface ComponentBase extends Transformable {
  owner: StepBase;
  props: Record<any, PropValue>;
  getProp(key: any): PropValue;
  patchProps(props: Record<any, PropValue>): void;
}
