/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Group } from "three";
import { Font } from "./font";
import { Step } from "./step";
import { Vec3 } from "./math";

export type PropValue = string | number | undefined | Font | ArrayBuffer;

export abstract class Component<Props = Record<string, PropValue>> {
  protected props: Props;
  readonly group: Group;
  isClickable: boolean;
  owner: Step;

  constructor(props: Props) {
    this.group = new Group();
    this.group.userData.component = this;
    this.updateProps(props);
    this.init();
  }

  setOwner(s: Step): void {
    if (this.owner) {
      this.owner.del(this);
    }
    this.owner = s;
  }

  getProp(key: string): PropValue {
    return (this as any).props[key];
  }

  setProp(key: string, value: PropValue): void {
    this.updateProps({
      ...this.props,
      [key]: value
    });
  }

  updateProps(props: Props) {
    // I hope it does not cause a memory leak :/
    this.group.children.length = 0;
    this.props = props;
    this.render();
  }

  setPosition(x: number, y: number, z: number): void {
    this.group.position.set(x, y, z);
  }

  setRotation(x: number, y: number, z: number): void {
    this.group.rotation.set(x, y, z);
  }

  getPosition(): Vec3 {
    const { x, y, z } = this.group.position;
    return { x, y, z };
  }

  getRotation(): Vec3 {
    const { x, y, z } = this.group.rotation;
    return { x, y, z };
  }

  click(): void {}
  animationFrame(frame: number): void {}

  protected abstract render(): void;
  protected abstract init(): void;
}
