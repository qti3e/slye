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
import { Component, PropValue } from "./component";
import { Presentation } from "./presentation";

interface Action<P, T> {
  readonly forward: (data: P) => T;
  readonly backward: (data: T) => void;
}

type TransformForwardData = {
  object: Step | Component;
  prevX: number;
  prevY: number;
  prevZ: number;
  x: number;
  y: number;
  z: number;
};

type TransformBackwardData = {
  object: Step | Component;
  prevX: number;
  prevY: number;
  prevZ: number;
};

export interface ActionTypes {
  DELETE_STEP: Action<
    { step: Step },
    { step: Step; presentation: Presentation; index: number }
  >;
  DELETE_COMPONENT: Action<
    { component: Component<any> },
    { component: Component<any>; step: Step }
  >;
  UPDATE_POSITION: Action<TransformForwardData, TransformBackwardData>;
  UPDATE_ROTATION: Action<TransformForwardData, TransformBackwardData>;
  UPDATE_SCALE: Action<TransformForwardData, TransformBackwardData>;
  UPDATE_PROPS: Action<
    { component: Component<any>; patch: Record<string, PropValue> },
    { component: Component<any>; patch: Record<string, PropValue> }
  >;
  INSERT_COMPONENT: Action<
    { step: Step; component: Component<any> },
    { component: Component<any> }
  >;
  // TODO(qti3e)
  // NEW_STEP: Creates a new step
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
  },
  DELETE_COMPONENT: {
    forward({ component }) {
      const step = component.owner;
      step.del(component);
      return { step, component };
    },
    backward({ component, step }) {
      step.add(component);
    }
  },
  UPDATE_POSITION: {
    forward({ object, prevX, prevY, prevZ, x, y, z }) {
      object.setPosition(x, y, z);
      return { object, prevX, prevY, prevZ };
    },
    backward({ object, prevX, prevY, prevZ }) {
      object.setPosition(prevX, prevY, prevZ);
    }
  },
  UPDATE_ROTATION: {
    forward({ object, prevX, prevY, prevZ, x, y, z }) {
      object.setRotation(x, y, z);
      return { object, prevX, prevY, prevZ };
    },
    backward({ object, prevX, prevY, prevZ }) {
      object.setRotation(prevX, prevY, prevZ);
    }
  },
  UPDATE_SCALE: {
    forward({ object, prevX, prevY, prevZ, x, y, z }) {
      object.setScale(x, y, z);
      return { object, prevX, prevY, prevZ };
    },
    backward({ object, prevX, prevY, prevZ }) {
      object.setScale(prevX, prevY, prevZ);
    }
  },
  UPDATE_PROPS: {
    forward({ component, patch }) {
      const undoPatch: Record<string, PropValue> = {};
      for (const key in patch) {
        const value = component.getProp(key);
        if (value !== patch[key]) {
          undoPatch[key] = value;
        }
      }
      component.patchProps(patch);
      return { component, patch: undoPatch };
    },
    backward({ component, patch }) {
      component.patchProps(patch);
    }
  },
  INSERT_COMPONENT: {
    forward({ step, component }) {
      step.add(component);
      return { component };
    },
    backward({ component }) {
      const step = component.owner;
      step.del(component);
    }
  }
};
