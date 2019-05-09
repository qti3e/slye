/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { PresentationBase } from "../base";
import { HeadlessStep } from "./step";

export class HeadlessPresentation implements PresentationBase {
  steps: HeadlessStep[] = [];

  constructor(readonly uuid: string) {}

  del(step: HeadlessStep): void {
    const index = this.steps.indexOf(step);
    if (index < 0) return;

    step.owner = undefined;
    this.steps.splice(index, 1);
  }

  add(step: HeadlessStep): void {
    if (step.owner && step.owner !== this) {
      step.owner.del(step);
    }

    step.owner = this;
    this.steps.push(step);
  }

  getStepId(step: HeadlessStep): number {
    return this.steps.indexOf(step);
  }
}
