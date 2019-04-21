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
import { Presentation } from "./presentation";
import { Component } from "./component";

/**
 * An step is a slie, it is part of a presentation and has a few
 * different components in it.
 */
export class Step {
  /**
   * Owner.
   */
  readonly owner: Presentation;

  /**
   * Components.
   */
  components: Component[] = [];

  /**
   * Three.js Group for this step.
   */
  group: Group;

  constructor() {
    this.group = new Group();
  }

  /**
   * Set the owner - it can only be called one.
   */
  use(p: Presentation): void | never {
    if (this.owner) throw new Error("Can not reuse a step.");
    (this as any).owner = p;
  }

  /**
   * Render components.
   */
  render(frame: number): void {
    for (let i = 0; i < this.components.length; ++i) {
      this.components[i].render(frame);
    }
  }

  /**
   * Add/Move component c into this step.
   */
  add(c: Component): void {
    this.components.push(c);
    c.setStep(this);
    this.group.add(c.group);
    if (this.owner && c.isClickable) {
      this.owner.updateRaycastCache(this);
    }
  }

  /**
   * Remove the given component from this step.
   */
  del(c: Component): void {
    const index = this.components.indexOf(c);
    if (index > -1) {
      this.components.splice(index, 1);
      this.group.remove(c.group);
      if (this.owner && c.isClickable) {
        this.owner.updateRaycastCache(this);
      }
    }
  }
}
