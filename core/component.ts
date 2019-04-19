/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

export type ComponentInit = () => number;

export interface Component {
  render(): void;
}

/**
 * Component implementation.
 *
 * @internal
 */
export class SlyeComponent implements Component {
  /**
   * WAsm function.
   */
  renderCb: () => void;

  /**
   * Before every wasm call we must first call this function.
   */
  use: () => void;

  render(): void {
    if (!this.renderCb) return;
    this.use();
    this.renderCb();
  }
}
