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
  Transformable
} from "./base";
import { PropValue } from "./component";
import { actions, ActionTypes, TakenAction, ForwardData } from "./actions";
import { Vec3 } from "./math";

const LIMIT = 17;

type Listener = (forward: boolean, action: string, data: any) => void;

export class ActionStack {
  private readonly actions: TakenAction<keyof ActionTypes>[] = [];
  private cursor = -1;
  listener: Listener;

  private action<T extends keyof ActionTypes>(
    name: T,
    forwardData: ForwardData<T>
  ): void {
    // TS is stupid.
    const backwardData = actions[name].forward(forwardData as any);
    if (this.listener) this.listener(true, name, forwardData);
    const action: TakenAction<T> = {
      name,
      forwardData,
      backwardData: backwardData as any
    };
    // Now push the action to the stack.
    this.cursor += 1;
    this.actions.splice(this.cursor, Infinity, action);
    if (this.actions.length > LIMIT) {
      const count = this.actions.length - LIMIT;
      this.actions.splice(0, count);
      this.cursor -= count;
    }
    // Debug.
    console.log(name, { forwardData, backwardData });
  }

  undo(): void {
    if (this.cursor < 0) return;
    const takenAction = this.actions[this.cursor];
    const action = actions[takenAction.name];
    action.backward(takenAction.backwardData as any);
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
    action.forward(takenAction.forwardData as any);
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
}
