/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { StepBase } from "../interfaces";
import { ThreePresentation } from "./presentation";
import { ThreeComponent } from "./component";
import { Group } from "./group";

export class ThreeStep extends Group implements StepBase {
  /**
   * Used for optimizations, you should never change this.
   */
  readonly isSlyeStep = true;

  /**
   * List of components that this step owns.
   */
  readonly components: ThreeComponent[];

  /**
   * Current owner of this step.
   */
  owner: ThreePresentation;

  /**
   * Creates a new ThreeStep instance.
   *
   * @param {string} uuid Steps' Unique ID.
   */
  constructor(readonly uuid: string) {
    super();
  }

  del(component: ThreeComponent): void {
    if (component.owner !== this) return;
    const index = this.components.indexOf(component);
    this.components.splice(index, 1);
    this.group.remove(component.group);
  }

  add(component: ThreeComponent): void {
    if (component.owner === this) return;
    if (component.owner) component.owner.del(component);
    this.components.push(component);
    this.group.add(component.group);
  }
}
