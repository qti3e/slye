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

export class Ease<T> {
  private start: number;
  private endFrame: number;
  private finished: boolean;
  private fn: EaseFunction;

  constructor(
    currentFrame: number,
    numFrames: number,
    private readonly obj: T,
    private readonly target: Partial<T> & Record<string, number>,
    easeFunction: EaseFunctionName = "easeInOutQuad"
  ) {
    this.start = currentFrame;
    this.endFrame = this.start + numFrames;
    this.finished = false;
  }

  update(frame: number): void {
    if (this.finished) return;

    let factor =
      frame >= this.endFrame
        ? 1
        : this.fn((frame - this.start) / this.endFrame);

    // Floating point calculations are so inaccurate.
    // We don't want to mess up because of that.
    if (factor > 0.99999999 && factor < 1.00000001) factor = 1;

    this.finished = factor == 1;

    for (const key in this.target) {
      (this.obj as any)[key] = this.target[key] * factor;
    }
  }
}
