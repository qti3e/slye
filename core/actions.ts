/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Step } from "./step";
import { Presentation } from "./presentation";

interface Action<P, T> {
  readonly forward: (data: P) => T;
  readonly backward: (data: T) => void;
}

export interface ActionTypes {
  readonly DELETE_STEP: Action<
    { step: Step },
    { step: Step; presentation: Presentation; index: number }
  >;
}

export type ForwardData<
  T extends keyof ActionTypes
> = ActionTypes[T] extends Action<infer R, any> ? R : never;

export type BackwardData<
  T extends keyof ActionTypes
> = ActionTypes[T] extends Action<any, infer R> ? R : never;

export interface TakenAction<T extends keyof ActionTypes> {
  name: T;
  forwardData: ForwardData<T>;
  backwardData: BackwardData<T>;
}

type ActionsMap = { [K in keyof ActionTypes]: ActionTypes[K] };

export const actions: ActionsMap = {
  DELETE_STEP: {
    forward({ step }) {
      const presentation = step.owner;
      const index = presentation.getStepId(step);
      presentation.del(step);
      return { step, presentation, index };
    },
    backward({ index, presentation, step }) {
      presentation.add(step, index);
    }
  }
};
