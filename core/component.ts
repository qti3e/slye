/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Group } from "three";
import { Font } from "./font";
import { Step } from "./step";
import { Vec3 } from "./math";

export type ComponentInit = () => number;
export type ClickHandler = () => void;
export type RenderHandler = (frame: number) => void;

export type PropValue = string | number | undefined | Font | ArrayBuffer;

export abstract class Component {
  readonly group: Group;
  isClickable: boolean;
  owner: Step;

  constructor() {
    this.group = new Group();
    this.group.userData.component = this;
  }

  setOwner(s: Step): void {}

  // Event handlers.
  click(): void {}
  render(frame: number): void {}

  // Props.
  getProp(key: string): PropValue {
    return null;
  }

  // Position & Rotation.
  setPosition(x: number, y: number, z: number): void {}
  setRotation(x: number, y: number, z: number): void {}
  getPosition(): Vec3 {
    return null;
  }
  getRotation(): Vec3 {
    return null;
  }
}
