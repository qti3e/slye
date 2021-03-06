/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { ComponentBase, PropValue, ComponentProps } from "../interfaces";
import { HeadlessStep } from "./step";
import { TransformableImpl } from "./transformable";

export class HeadlessComponent extends TransformableImpl
  implements ComponentBase {
  readonly isSlyeComponent = true;
  owner: HeadlessStep;
  props: ComponentProps;

  constructor(
    readonly uuid: string,
    readonly moduleName: string,
    readonly componentName: string,
    props: Record<any, PropValue>
  ) {
    super();
    this.props = props;
  }

  getProp(key: any): PropValue {
    return this.props[key];
  }

  patchProps(patch: ComponentProps): void {
    this.props = {
      ...this.props,
      ...patch
    };
  }
}
