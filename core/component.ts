/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Box3, Group } from "three";
import { Font } from "./font";
import { Mem } from "./mem";
import { Step } from "./step";
import { Vec3 } from "./math";

export type ComponentInit = () => number;
export type ClickHandler = () => void;
export type RenderHandler = (frame: number) => void;

export interface Component {
  group: Group;
  isClickable: boolean;
  setStep(s: Step): void;
  owner: Step;
  mem: Mem;
  // Event handlers.
  click(): void;
  render(frame: number): void;
  // Props.
  getProp(key: string): PropValue;
  // Position & Rotation.
  setPosition(x: number, y: number, z: number): void;
  setRotation(x: number, y: number, z: number): void;
  getPosition(): Vec3;
  getRotation(): Vec3;
}

export type PropValue = string | number | undefined | Font | ArrayBuffer;

/**
 * Component implementation.
 *
 * @internal
 */
export class SlyeComponent implements Component {
  /**
   * This function is set by module.ts when this class is created.
   * It must be called before any WAsm function call.
   */
  private readonly use: () => void;

  /**
   * Props.
   */
  private readonly props: Map<string, PropValue> = new Map();

  /**
   * Components heap memory - used to store data such as a material.
   */
  readonly mem: Mem = new Mem();

  /**
   * Step which contains this component.
   */
  readonly owner: Step;

  /**
   * Three.js group for this component.
   */
  readonly group: Group;

  /**
   * Whatever this component is clickable or not.
   */
  isClickable = false;

  constructor(props: Record<string, PropValue>) {
    this.group = new Group();
    this.group.userData.component = this;

    for (const key in props) {
      this.props.set(key, props[key]);
    }

    //window.g = this;
  }

  setStep(s: Step): void {
    if (this.owner) {
      this.owner.del(this);
    }
    (this as any).owner = s;
  }

  setClickHandler(cb: ClickHandler): void {
    this.isClickable = true;
    this.click = () => {
      this.use();
      cb();
    };
    // Ugly but it works.
    if (this.owner && this.owner.owner) {
      this.owner.owner.updateRaycastCache(this.owner);
    }
  }

  setRenderHandler(cb: RenderHandler): void {
    this.render = (frame: number) => {
      this.use();
      cb(frame);
    };
  }

  getProp(key: string): PropValue {
    return this.props.get(key);
  }

  setPosition(x: number, y: number, z: number): void {
    this.group.position.set(x, y, z);
  }

  setRotation(x: number, y: number, z: number): void {
    this.group.rotation.set(x, y, z);
  }

  getPosition(): Vec3 {
    return {
      x: this.group.position.x,
      y: this.group.position.y,
      z: this.group.position.z
    };
  }

  getRotation(): Vec3 {
    return {
      x: this.group.rotation.x,
      y: this.group.rotation.y,
      z: this.group.rotation.z
    };
  }

  render(frame: number): void {}
  click(): void {}
}
