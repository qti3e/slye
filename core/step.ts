/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Presentation } from "./presentation";
import { Vec3 } from "./math";

export class Step {
  private presentation: Presentation;
  position: Vec3;
  rotation: Vec3;

  use(p: Presentation): void | never {
    if (this.presentation) throw new Error("Can not reuse a step.");
    this.presentation = p;
  }

  render(frame: number) {}
}
