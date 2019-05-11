/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Transformable } from "./transformable";
import { PresentationBase } from "./presentation";
import { ComponentBase } from "./component";

/**
 * Basic informations to represent a Slye Step. (A.K.A Slide)
 */
export interface StepBase extends Transformable {
  /**
   * Unique id for this step.
   */
  readonly uuid: string;

  /**
   * Used for optimizations, you should never change this.
   */
  readonly isSlyeStep: true;

  /**
   * List of components that this step owns.
   */
  readonly components: ComponentBase[];

  /**
   * Presentation that owns this step.
   */
  owner: PresentationBase;

  /**
   * Remove the given component from this step.
   *
   * @param {ComponentBase} component Component which you want to remove.
   * @returns {void}
   */
  del(component: ComponentBase): void;

  /**
   * Add the given component to the step, removes the component from it's
   * current parent if there is one.
   *
   * @param {ComponentBase} component Component which you want to add into this
   * step.
   * @returns {void}
   */
  add(component: ComponentBase): void;
}
