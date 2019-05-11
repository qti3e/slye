/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Vec3 } from "./common";

/**
 * A transformable object is any object that can be part of the
 * rendering space. (currently only Components and Steps)
 */
export interface Transformable {
  /**
   * Set the position.
   *
   * @param {number} x Value for the `x` axis.
   * @param {number} y Value for the `r` axis.
   * @param {number} z Value for the `z` axis.
   * @return {void}
   */
  setPosition(x: number, y: number, z: number): void;

  /**
   * Set the orientation, values must be in radian.
   *
   * @param {number} x Value for the `x` axis.
   * @param {number} y Value for the `r` axis.
   * @param {number} z Value for the `z` axis.
   * @return {void}
   */
  setRotation(x: number, y: number, z: number): void;

  /**
   * Set the scale factor.
   *
   * @param {number} x Value for the `x` axis.
   * @param {number} y Value for the `r` axis.
   * @param {number} z Value for the `z` axis.
   * @return {void}
   */
  setScale(x: number, y: number, z: number): void;

  /**
   * Returns the current position as a Slye Vec3.
   *
   * @returns {Vec3}
   */
  getPosition(): Vec3;

  /**
   * Returns the current orientation as a Slye Vec3.
   *
   * @returns {Vec3}
   */
  getRotation(): Vec3;

  /**
   * Returns the current scale factors as a Slye Vec3.
   *
   * @returns {Vec3}
   */
  getScale(): Vec3;
}
