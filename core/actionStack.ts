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
import { Component } from "./component";
import { actions, ActionTypes, TakenAction, ForwardData } from "./actions";
import { Vec3 } from "./math";

export class ActionStack {
  private readonly actions: TakenAction<keyof ActionTypes>[] = [];
  private cursor = -1;

  private action<T extends keyof ActionTypes>(
    name: T,
    forwardData: ForwardData<T>
  ): void {
    // TS is stupid.
    const backwardData = actions[name].forward(forwardData as any);
    const action: TakenAction<T> = {
      name,
      forwardData,
      backwardData: backwardData as any
    };
    // Now push the action to the stack.
    this.cursor += 1;
    this.actions.splice(this.cursor, Infinity, action);
    // Debug.
    console.log(name, { forwardData, backwardData });
  }

  undo(): void {
    if (this.cursor < 0) return;
    const takenAction = this.actions[this.cursor];
    const action = actions[takenAction.name];
    action.backward(takenAction.backwardData as any);
    this.cursor -= 1;
  }

  redo(): void {
    if (this.cursor + 1 === this.actions.length) return;
    this.cursor += 1;
    const takenAction = this.actions[this.cursor];
    const action = actions[takenAction.name];
    action.forward(takenAction.forwardData as any);
  }

  deleteStep(step: Step): void {
    this.action("DELETE_STEP", {
      step
    });
  }

  deleteComponent(component: Component): void {
    this.action("DELETE_COMPONENT", {
      component
    });
  }

  transform(
    mode: "translate" | "rotate" | "scale",
    object: Component | Step,
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
}
