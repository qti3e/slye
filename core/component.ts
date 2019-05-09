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
import { Step } from "./step";
import { Vec3 } from "./math";
import { Widgets } from "./ui";
import { ComponentBase, FontBase } from "./base";

export type PropValue = string | number | undefined | FontBase | ArrayBuffer;

export abstract class Component<
  Props extends Record<any, PropValue> = Record<string, PropValue>
> implements ComponentBase {
  private isUpdating = false;
  private nextProps: Props;
  public abstract readonly ui: Widgets<Props>;

  props: Props;
  readonly group: Group;
  isClickable: boolean;
  owner: Step;

  constructor(
    readonly uuid: string,
    readonly moduleName: string,
    readonly componentName: string,
    props: Props
  ) {
    this.group = new Group();
    this.group.userData.component = this;
    this.updateProps(props);
    this.init();
  }

  setOwner(s: Step): void {
    if (this.owner && this.owner !== s) {
      this.owner.del(this);
    }
    this.owner = s;
  }

  getProp<T extends keyof Props>(key: T): Props[T] {
    return this.props[key];
  }

  setProp<T extends keyof Props>(key: T, value: Props[T]): void {
    this.updateProps({
      ...this.props,
      [key]: value
    });
  }

  patchProps(props: Partial<Props>) {
    this.updateProps({
      ...this.props,
      ...props
    });
  }

  updateProps(props: Props) {
    if (this.isUpdating) {
      this.nextProps = props;
      return;
    }
    // I hope it does not cause a memory leak :/
    this.group.children.length = 0;
    this.props = props;

    this.isUpdating = true;

    (async () => {
      try {
        await this.render();
      } catch (e) {
        console.error(e);
        this.group.children.length = 0;
      }

      this.isUpdating = false;
      if (this.nextProps) {
        props = this.nextProps;
        this.nextProps = undefined;
        this.updateProps(props);
      }
    })();
  }

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

  click(): void {}
  animationFrame(frame: number): void {}

  protected abstract render(): Promise<void>;
  protected abstract init(): void;
}
