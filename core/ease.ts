/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

/**
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
const EasingFunctions = {
  // no easing, no acceleration.
  linear: (t: number) => t,
  // accelerating from zero velocity.
  easeInQuad: (t: number) => t * t,
  // decelerating to zero velocity.
  easeOutQuad: (t: number) => t * (2 - t),
  // acceleration until halfway, then deceleration.
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  // accelerating from zero velocity.
  easeInCubic: (t: number) => t * t * t,
  // decelerating to zero velocity.
  easeOutCubic: (t: number) => --t * t * t + 1,
  // acceleration until halfway, then deceleration.
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  // accelerating from zero velocity.
  easeInQuart: (t: number) => t * t * t * t,
  // decelerating to zero velocity.
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  // acceleration until halfway, then deceleration.
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  // accelerating from zero velocity.
  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => 1 + --t * t * t * t * t,
  // acceleration until halfway, then deceleration.
  easeInOutQuint: (t: number) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
};

type EaseFunction = (f: number) => number;

export type EaseFunctionName = keyof typeof EasingFunctions;

/**
 * Ease provides a simple API for easing functionality.
 */
export class Ease<T> {
  /**
   * Start time of the ease.
   */
  private start: number;

  /**
   * End time of the ease.
   */
  private endFrame: number;

  /**
   * Easing function.
   */
  private fn: EaseFunction;

  /**
   * List of resolve functions for `wait` promises.
   */
  private resolves: (() => void)[] = [];

  /**
   * Whatever this ease has finished rendering or not.
   */
  public finished: boolean;

  /**
   * Original properties of the `obj` stored so that can be used in
   * computations.
   */
  private readonly original: Partial<T> & Record<string, number> = {};

  /**
   * Ease Constructor.
   *
   * @param {number} currentFrame Current frame number can also be a time.
   * @param {number} numFrames Number of frames in which we have to complete
   *  this ease.
   * @param {T} obj The object which we want to update.
   * @param {Partial<T> & Record<string, number>} target Target values.
   * @param {EaseFunctionName} easeFunction Name of easing function used in this
   * Ease instance.
   */
  constructor(
    currentFrame: number,
    private readonly numFrames: number,
    public readonly obj: T,
    private readonly target: Partial<T> & Record<string, number>,
    easeFunction: EaseFunctionName = "easeInOutQuad"
  ) {
    this.start = currentFrame;
    this.endFrame = this.start + numFrames;
    this.finished = false;
    this.fn = EasingFunctions[easeFunction];

    for (const key in target) {
      this.original[key] = (obj as any)[key];
      this.target[key] -= this.original[key];
    }
  }

  /**
   * Animation frame.
   *
   * @param {number} frame Current frame.
   * @returns {void}
   */
  update(frame: number): void {
    if (this.finished) return;

    let factor =
      frame >= this.endFrame
        ? 1
        : this.fn((frame - this.start) / this.numFrames);

    // Floating point calculations are so inaccurate.
    // We don't want to mess up because of that.
    if (factor > 0.99999 && factor < 1.00001) factor = 1;

    this.finished = factor == 1;

    for (const key in this.target) {
      (this.obj as any)[key] = this.original[key] + this.target[key] * factor;
    }

    if (this.finished) {
      for (let i = 0; i < this.resolves.length; ++i) this.resolves[i]();
    }
  }

  /**
   * Returns a new promise that will be resolved once the ease is finished.
   *
   * @returns {Promise<void>}
   */
  wait(): Promise<void> {
    if (this.finished) return Promise.resolve();
    return new Promise<void>(resolve => this.resolves.push(resolve));
  }
}
