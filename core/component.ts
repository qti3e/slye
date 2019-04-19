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

export interface Component {
  render(frame: number): void;
  step(s: Step): void;
  group: Group;
}

/**
 * Component implementation.
 *
 * @internal
 */
export class SlyeComponent implements Component {
  private owner: Step;

  group: Group;

  /**
   * WAsm function.
   */
  renderCb: (frame: number) => void;

  /**
   * Before every wasm call we must first call this function.
   */
  use: () => void;

  constructor() {
    this.group = new Group();

    var geometry = new BoxGeometry(1, 1, 1);
    var material = new MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new Mesh(geometry, material);

    setTimeout(() => this.group.add(cube), 2500);
  }

  step(s: Step): void {
    if (this.owner) {
      this.owner.del(this);
    }
    this.owner = s;
  }

  render(frame: number): void {
    if (!this.renderCb) return;
    this.use();
    this.renderCb(frame);
  }
}
