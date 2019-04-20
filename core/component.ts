/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { BoxGeometry, MeshBasicMaterial, Mesh, Group } from "three";
import { Step } from "./step";

export type ComponentInit = () => number;
export type ClickHandler = () => void;
export type RenderHandler = (frame: number) => void;

export interface Component {
  group: Group;
  isClickable: boolean;
  setStep(s: Step): void;
  owner: Step;
  // Event handlers
  click(): void;
  render(frame: number): void;
}

export type PropValue = string | number | undefined;

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

    window.g = this;
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

  render(frame: number): void {}
  click(): void {}
}
