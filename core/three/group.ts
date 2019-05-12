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

/**
 * Common methods from Step and Component.
 */
export class Group implements Transformable {
  /**
   * Three.js group that contains current instance's children.
   */
  readonly group: ThreeGroup = new ThreeGroup();

  /**
   * Set the position.
   *
   * @param {number} x Value for the `x` axis.
   * @param {number} y Value for the `r` axis.
   * @param {number} z Value for the `z` axis.
   * @return {void}
   */
  setPosition(x: number, y: number, z: number): void {
    this.group.position.set(x, y, z);
  }

  /**
   * Set the orientation, values must be in radian.
   *
   * @param {number} x Value for the `x` axis.
   * @param {number} y Value for the `r` axis.
   * @param {number} z Value for the `z` axis.
   * @return {void}
   */
  setRotation(x: number, y: number, z: number): void {
    this.group.rotation.set(x, y, z);
  }

  /**
   * Set the scale factor.
   *
   * @param {number} x Value for the `x` axis.
   * @param {number} y Value for the `r` axis.
   * @param {number} z Value for the `z` axis.
   * @return {void}
   */
  setScale(x: number, y: number, z: number): void {
    this.group.scale.set(x, y, z);
  }

  /**
   * Returns the current position as a Slye Vec3.
   *
   * @returns {Vec3}
   */
  getPosition(): Vec3 {
    const { x, y, z } = this.group.position;
    return { x, y, z };
  }

  /**
   * Returns the current orientation as a Slye Vec3.
   *
   * @returns {Vec3}
   */
  getRotation(): Vec3 {
    const { x, y, z } = this.group.rotation;
    return { x, y, z };
  }

  /**
   * Returns the current scale factors as a Slye Vec3.
   *
   * @returns {Vec3}
   */
  getScale(): Vec3 {
    const { x, y, z } = this.group.scale;
    return { x, y, z };
  }
}
