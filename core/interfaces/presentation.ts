/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { StepBase } from "./step";

/**
 * Basic informations and methods to represent a Slye Presentation.
 */
export interface PresentationBase {
  /**
   * Unique id for this presentation.
   */
  readonly uuid: string;

  /**
   * Used for optimizations, you should never change this.
   */
  readonly isSlyePresentation: true;

  /**
   * List of steps in this presentation.
   */
  steps: StepBase[];

  /**
   * Remove the given step from this presentation.
   *
   * @param {StepBase} step Step you want to remove.
   * @returns {void}
   */
  del(step: StepBase): void;

  /**
   * Insert the given step in the given offset, if `index` is not provided it
   * appends the step at the end of the list.
   *
   * @param {StepBase} step Step which you want to add into the presentation.
   * @param {number} index Index in the steps list.
   * @returns {void}
   */
  add(step: StepBase, index?: number): void;
}
