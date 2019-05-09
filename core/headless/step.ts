/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { StepBase } from "../base";
import { HeadlessPresentation } from "./presentation";
import { HeadlessComponent } from "./component";
import { TransformableImpl } from "./transormable";

export class HeadlessStep extends TransformableImpl implements StepBase {
  owner: HeadlessPresentation;
  components: HeadlessComponent[] = [];

  constructor(readonly uuid: string) {
    super();
  }

  del(component: HeadlessComponent): void {
    const index = this.components.indexOf(component);
    if (index < 0) return;

    component.owner = undefined;
    this.components.splice(index, 1);
  }

  add(component: HeadlessComponent): void {
    if (component.owner && component.owner !== this) {
      component.owner.del(component);
    }

    component.owner = this;
    this.components.push(component);
  }
}
