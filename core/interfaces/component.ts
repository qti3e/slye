/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Transformable } from "./transformable";
import { FontBase } from "./font";
import { StepBase } from "./step";
import { FileBase } from "./file";

/**
 * Any type that can be used as a prop value in a component.
 */
export type PropValue = string | number | boolean | FontBase | FileBase;

/**
 * Properties of a component.
 */
export type ComponentProps = Record<string, PropValue>;

/**
 * Basic informations and methods to represent a Slye Component.
 */
export interface ComponentBase extends Transformable {
  /**
   * Unique id for this step.
   */
  readonly uuid: string;

  /**
   * Name of the module that provided this component.
   */
  readonly moduleName: string;

  /**
   * Name of the component kind, it must be registered by the moduleName.
   */
  readonly componentName: string;

  /**
   * Used for optimizations, you should never change this.
   */
  readonly isSlyeComponent: true;

  /**
   * Current owner of this component.
   */
  owner: StepBase;

  /**
   * Current props of this component.
   */
  props: ComponentProps;

  // TODO(qti3e) We don't need this.
  getProp(key: any): PropValue;

  /**
   * Patch the given props to the current props.
   *
   * @param {ComponentProps} props Patch to be applied.
   * @returns {void}
   */
  patchProps(props: ComponentProps): void;
}
