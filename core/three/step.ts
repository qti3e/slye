/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { DoubleSide, PlaneGeometry, MeshBasicMaterial, Mesh } from "three";
import { StepBase } from "../interfaces";
import { ThreePresentation } from "./presentation";
import { ThreeComponent } from "./component";
import { Group } from "./group";

/**
 * A Three.js based implementation for Slye Step.
 */
export class ThreeStep extends Group implements StepBase {
  static readonly width = 5 * 19.2;
  static readonly height = 5 * 10.8;
  static readonly placeholderGeo = new PlaneGeometry(
    ThreeStep.width,
    ThreeStep.height,
    2
  );
  static readonly placeholderMatt = new MeshBasicMaterial({
    color: 0xe0e0e0,
    opacity: 0.5,
    transparent: true,
    side: DoubleSide
  });

  /**
   * Used for optimizations, you should never change this.
   */
  readonly isSlyeStep = true;

  /**
   * List of components that this step owns.
   */
  readonly components: ThreeComponent[] = [];

  /**
   * Current owner of this step.
   */
  owner: ThreePresentation;

  /**
   * Creates a new ThreeStep instance.
   *
   * @param {string} uuid Steps' Unique ID.
   */
  constructor(readonly uuid: string) {
    super();
    this.group.userData.step = this;
    const plane = new Mesh(ThreeStep.placeholderGeo, ThreeStep.placeholderMatt);
    this.group.add(plane);
  }

  /**
   * Removes `component` from this step.
   *
   * @param {ThreeComponent} component Component which you want to remove.
   * @returns {void}
   */
  del(component: ThreeComponent): void {
    if (component.owner !== this) return;
    component.owner = undefined;
    const index = this.components.indexOf(component);
    this.components.splice(index, 1);
    this.group.remove(component.group);
  }

  /**
   * Adds `component` to this step.
   *
   * @param {ThreeComponent} component Component which you want to add into this
   * step.
   * @returns {void}
   */
  add(component: ThreeComponent): void {
    if (component.owner === this) return;
    if (component.owner) component.owner.del(component);
    component.owner = this;
    this.components.push(component);
    this.group.add(component.group);
  }
}
