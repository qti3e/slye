/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { ComponentBase } from "../base";
import { PropValue } from "../component";
import { HeadlessStep } from "./step";
import { TransformableImpl } from "./transormable";

export class HeadlessComponent extends TransformableImpl
  implements ComponentBase {
  owner: HeadlessStep;
  props: Record<any, PropValue>;

  constructor(readonly uuid: string, readonly moduleName: string, readonly componentName: string, props: Record<any, PropValue>) {
    super();
    this.props = props;
  }

  getProp(key: any): PropValue {
    return this.props[key];
  }

  patchProps(patch: Record<any, PropValue>): void {
    this.props = {
      ...this.props,
      ...patch
    };
  }
}
