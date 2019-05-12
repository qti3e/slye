/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import {
  ComponentBase,
  PresentationBase,
  StepBase,
  Transformable,
  PropValue
} from "./interfaces";

export interface Action<P, T> {
  readonly forward: (presentation: PresentationBase, data: P) => T;
  readonly backward: (presentation: PresentationBase, data: T) => void;
}

type TransformForwardData = {
  object: Transformable;
  prevX: number;
  prevY: number;
  prevZ: number;
  x: number;
  y: number;
  z: number;
};

type TransformBackwardData = {
  object: Transformable;
  prevX: number;
  prevY: number;
  prevZ: number;
};

export interface ActionTypes {
  DELETE_STEP: Action<{ step: StepBase }, { step: StepBase; index: number }>;
  DELETE_COMPONENT: Action<
    { component: ComponentBase },
    { component: ComponentBase; step: StepBase }
  >;
  UPDATE_POSITION: Action<TransformForwardData, TransformBackwardData>;
  UPDATE_ROTATION: Action<TransformForwardData, TransformBackwardData>;
  UPDATE_SCALE: Action<TransformForwardData, TransformBackwardData>;
  UPDATE_PROPS: Action<
    { component: ComponentBase; patch: Record<any, PropValue> },
    { component: ComponentBase; patch: Record<any, PropValue> }
  >;
  INSERT_COMPONENT: Action<
    { step: StepBase; component: ComponentBase },
    { component: ComponentBase }
  >;
  INSERT_STEP: Action<{ step: StepBase }, { step: StepBase }>;
}

export const actions: ActionTypes = {
  DELETE_STEP: {
    forward(presentation, { step }) {
      const index = presentation.steps.indexOf(step);
      if (index >= 0) presentation.del(step);
      return { step, index };
    },
    backward(presentation, { index, step }) {
      if (index < 0) return;
      presentation.add(step, index);
    }
  },
  DELETE_COMPONENT: {
    forward(presentation, { component }) {
      const step = component.owner;
      step.del(component);
      return { step, component };
    },
    backward(presentation, { component, step }) {
      step.add(component);
    }
  },
  UPDATE_POSITION: {
    forward(presentation, { object, prevX, prevY, prevZ, x, y, z }) {
      object.setPosition(x, y, z);
      return { object, prevX, prevY, prevZ };
    },
    backward(presentation, { object, prevX, prevY, prevZ }) {
      object.setPosition(prevX, prevY, prevZ);
    }
  },
  UPDATE_ROTATION: {
    forward(presentation, { object, prevX, prevY, prevZ, x, y, z }) {
      object.setRotation(x, y, z);
      return { object, prevX, prevY, prevZ };
    },
    backward(presentation, { object, prevX, prevY, prevZ }) {
      object.setRotation(prevX, prevY, prevZ);
    }
  },
  UPDATE_SCALE: {
    forward(presentation, { object, prevX, prevY, prevZ, x, y, z }) {
      object.setScale(x, y, z);
      return { object, prevX, prevY, prevZ };
    },
    backward(presentation, { object, prevX, prevY, prevZ }) {
      object.setScale(prevX, prevY, prevZ);
    }
  },
  UPDATE_PROPS: {
    forward(presentation, { component, patch }) {
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
    backward(presentation, { component, patch }) {
      component.patchProps(patch);
    }
  },
  INSERT_COMPONENT: {
    forward(presentation, { step, component }) {
      step.add(component);
      return { component };
    },
    backward(presentation, { component }) {
      const step = component.owner;
      step.del(component);
    }
  },
  INSERT_STEP: {
    forward(presentation, { step }) {
      presentation.add(step);
      return { step };
    },
    backward(presentation, { step }) {
      presentation.del(step);
    }
  }
};
