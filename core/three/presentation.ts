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
import { PresentationBase } from "../interfaces";
import { ThreeStep } from "./step";

/**
 * ThreePresentation is a Three.js based implementation of Slye Presentation.
 */
export class ThreePresentation implements PresentationBase {
  /**
   * Used for optimizations, you should never change this.
   */
  readonly isSlyePresentation = true;

  /**
   * This group will contain ThreeStep's groups.
   */
  readonly group: Group = new Group();

  /**
   * List of steps in this presentation.
   */
  readonly steps: ThreeStep[] = [];

  /**
   * Creates a new ThreePresentation instance.
   *
   * @param {string} uuid Presentation's Unique ID.
   */
  constructor(readonly uuid: string) {}

  /**
   * Remove the given step from this presentation.
   *
   * @param {ThreeStep} step Step you want to remove.
   * @returns {void}
   */
  del(step: ThreeStep): void {
    if (step.owner !== this) return;
    step.owner = undefined;
    const index = this.steps.indexOf(step);
    this.steps.splice(index, 1);
    this.group.remove(step.group);
  }

  /**
   * Insert the given step in the given offset, if `index` is not provided it
   * appends the step at the end of the list.
   *
   * @param {StepBase} step Step which you want to add into the presentation.
   * @param {number} index Index in the steps list.
   * @returns {void}
   */
  add(step: ThreeStep, index?: number): void {
    if (step.owner) step.owner.del(step);
    step.owner = this;
    index = index || this.steps.length;
    this.steps.splice(index, 0, step);
    this.group.add(step.group);
  }
}
