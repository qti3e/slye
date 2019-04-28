/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import {
  DoubleSide,
  Group,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh
} from "three";
import { Presentation } from "./presentation";
import { Component } from "./component";
import { Vec3 } from "./math";

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

  constructor(private readonly uuid: string) {
    this.group = new Group();
    // TODO(qti3e) Reuse these.
    const geometry = new PlaneGeometry(2 * 19.20, 2 * 10.80, 2);
    const material = new MeshBasicMaterial({
      color: 0xffff00,
      side: DoubleSide
    });

    // We add an invisible plane to each step, so in this case we can still
    // have a non-zero width and height for the step when it has no component
    // in it.
    const plane = new Mesh(geometry, material);
    plane.visible = false;
    this.group.add(plane);
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
    c.setOwner(this);
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

  setPosition(x: number, y: number, z: number): void {
    this.group.position.set(x, y, z);
  }

  setRotation(x: number, y: number, z: number): void {
    this.group.rotation.set(x, y, z);
  }

  getPosition(): Vec3 {
    return {
      x: this.group.position.x,
      y: this.group.position.y,
      z: this.group.position.z
    };
  }

  getRotation(): Vec3 {
    return {
      x: this.group.rotation.x,
      y: this.group.rotation.y,
      z: this.group.rotation.z
    };
  }
}
