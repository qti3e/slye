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
  PropValue,
  Vec3
} from "./interfaces";
import { actions, Action, ActionTypes } from "./actions";

const LIMIT = 17;

type Listener = (forward: boolean, action: string, data: any) => void;

export type ForwardData<
  T extends keyof ActionTypes
> = ActionTypes[T] extends Action<infer R, any> ? R : never;

export interface TakenAction<T extends keyof ActionTypes> {
  name: T;
  forwardData: any;
  backwardData: any;
}

export class ActionStack {
  private readonly actions: TakenAction<keyof ActionTypes>[] = [];
  private cursor = -1;
  listener: Listener;

  constructor(readonly presentation: PresentationBase) {}

  private action<T extends keyof ActionTypes>(
    name: T,
    forwardData: ForwardData<T>
  ): void {
    const backwardData = actions[name].forward(
      this.presentation,
      // TS is stupid.
      forwardData as any
    );
    if (this.listener) this.listener(true, name, forwardData);
    const action: TakenAction<T> = {
      name,
      forwardData,
      backwardData: backwardData
    };
    // Now push the action to the stack.
    this.cursor += 1;
    this.actions.splice(this.cursor, Infinity, action);
    if (this.actions.length > LIMIT) {
      const count = this.actions.length - LIMIT;
      this.actions.splice(0, count);
      this.cursor -= count;
    }
  }

  undo(): void {
    if (this.cursor < 0) return;
    const takenAction = this.actions[this.cursor];
    const action = actions[takenAction.name];
    action.backward(this.presentation, takenAction.backwardData);
    this.cursor -= 1;
    if (this.listener) {
      this.listener(false, takenAction.name, takenAction.backwardData);
    }
  }

  redo(): void {
    if (this.cursor + 1 === this.actions.length) return;
    this.cursor += 1;
    const takenAction = this.actions[this.cursor];
    const action = actions[takenAction.name];
    action.forward(this.presentation, takenAction.forwardData);
    if (this.listener) {
      this.listener(true, takenAction.name, takenAction.forwardData);
    }
  }

  deleteStep(step: StepBase): void {
    this.action("DELETE_STEP", {
      step
    });
  }

  deleteComponent(component: ComponentBase): void {
    this.action("DELETE_COMPONENT", {
      component
    });
  }

  transform(
    mode: "translate" | "rotate" | "scale",
    object: Transformable,
    { x: prevX, y: prevY, z: prevZ }: Vec3,
    { x, y, z }: Vec3
  ): void {
    const action =
      mode === "translate"
        ? "UPDATE_POSITION"
        : mode === "rotate"
        ? "UPDATE_ROTATION"
        : "UPDATE_SCALE";

    this.action(action, {
      object,
      x,
      y,
      z,
      prevX,
      prevY,
      prevZ
    });
  }

  updateProps<T extends Record<any, PropValue>>(
    component: ComponentBase,
    patch: Partial<T>
  ): void {
    this.action("UPDATE_PROPS", {
      component,
      patch
    });
  }

  insertComponent(step: StepBase, component: ComponentBase): void {
    this.action("INSERT_COMPONENT", {
      step,
      component
    });
  }

  insertStep(step: StepBase, presentation: PresentationBase): void {
    this.action("INSERT_STEP", {
      step
    });
  }
}
