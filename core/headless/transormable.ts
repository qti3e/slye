/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Transformable } from "../base";
import { Vec3 } from "../math";

export class TransformableImpl implements Transformable {
  private position: Vec3 = { x: 0, y: 0, z: 0 };
  private rotation: Vec3 = { x: 0, y: 0, z: 0 };
  private scale: Vec3 = { x: 1, y: 1, z: 1 };

  setPosition(x: number, y: number, z: number): void {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }

  setRotation(x: number, y: number, z: number): void {
    this.rotation.x = x;
    this.rotation.y = y;
    this.rotation.z = z;
  }

  setScale(x: number, y: number, z: number): void {
    this.scale.x = x;
    this.scale.y = y;
    this.scale.z = z;
  }

  getPosition(): Vec3 {
    const { x, y, z } = this.position;
    return { x, y, z };
  }

  getRotation(): Vec3 {
    const { x, y, z } = this.rotation;
    return { x, y, z };
  }

  getScale(): Vec3 {
    const { x, y, z } = this.scale;
    return { x, y, z };
  }
}
