/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { ComponentBase, ComponentProps, PropValue } from "../interfaces";
import { ThreeStep } from "./step";
import { Group } from "./group";

export abstract class ThreeComponent extends Group implements ComponentBase {
  readonly isSlyeComponent = true;

  owner: ThreeStep;

  constructor(
    readonly uuid: string,
    readonly moduleName: string,
    readonly componentName: string,
    public props: ComponentProps
  ) {
    super();
  }

  getProp(key: string): PropValue {
    return this.props[key];
  }

  patchProps(props: ComponentProps): void {
    this.props = {
      ...this.props,
      ...props
    };
  }
}
