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
import { Widgets } from "../ui";

/**
 * Abstract Three.js based implementation for Slye Components.
 * It is to be used in modules.
 */
export abstract class ThreeComponent<
  Props extends Record<string, PropValue> = Record<string, PropValue>
> extends Group implements ComponentBase {
  /**
   * Used for optimizations, you should never change this.
   */
  readonly isSlyeComponent = true;

  /**
   * Current props for this component.
   */
  props: Props;

  /**
   * Current owner of this component.
   */
  owner: ThreeStep;

  /**
   * Whatever component is currently in a render call or not.
   */
  private isUpdating = false;

  /**
   * When `isUpdating` is true and we try to update props, that call will return
   * immediately and it sets this value, at the end of a render call we check
   * this value and if it's not undefined we re update the props.
   */
  private nextProps: Props;

  /**
   * UI widgets to be shown in editor.
   */
  abstract readonly ui: Widgets<Props>;

  /**
   * ThreeComponent constructor.
   *
   * @param {string} uuid Component's Unique ID.
   * @param {string} moduleName Name of the module that provides this component.
   * @param {string} componentName Component kind.
   * @param {Props} Initial props.
   */
  constructor(
    readonly uuid: string,
    readonly moduleName: string,
    readonly componentName: string,
    props: Props
  ) {
    super();
    this.group.userData.component = this;
    this.init();
    this.updateProps(props);
  }

  /**
   * Update the props and re-renders the component.
   *
   * @param {Props} props New props.
   * @returns {void}
   */
  private updateProps(props: Props): void {
    if (this.isUpdating) {
      this.nextProps = props;
      return;
    }

    // TODO(qti3e) Dispose every child gracefully.
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

  /**
   * Returns the prop value by its key.
   *
   * @param {keyof Props} key Property name.
   * @returns {PropValue}
   */
  getProp<T extends keyof Props>(key: T): Props[T] {
    return this.props[key];
  }

  /**
   * Patch a set of properties to the component and update it.
   *
   * @param {Partial<Props>} New props.
   * @returns {void}
   */
  patchProps(props: Partial<Props>): void {
    this.updateProps({
      ...this.props,
      ...this.nextProps,
      ...props
    });
  }

  protected abstract render(): Promise<void>;
  protected abstract init(): void;
}
