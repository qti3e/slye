/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Group as ThreeGroup } from "three";
import { Transformable, Vec3 } from "../interfaces";

export class Group implements Transformable {
  readonly group: ThreeGroup = new ThreeGroup();

  setPosition(x: number, y: number, z: number): void {
    this.group.position.set(x, y, z);
  }

  setRotation(x: number, y: number, z: number): void {
    this.group.rotation.set(x, y, z);
  }

  setScale(x: number, y: number, z: number): void {
    this.group.scale.set(x, y, z);
  }

  getPosition(): Vec3 {
    const { x, y, z } = this.group.position;
    return { x, y, z };
  }

  getRotation(): Vec3 {
    const { x, y, z } = this.group.rotation;
    return { x, y, z };
  }

  getScale(): Vec3 {
    const { x, y, z } = this.group.scale;
    return { x, y, z };
  }
}
