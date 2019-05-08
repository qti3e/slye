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
import { actions, ActionTypes, TakenAction, ForwardData } from "./actions";

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
  }

  undo() {
    if (this.cursor < 0) return;
    const takenAction = this.actions[this.cursor];
    const action = actions[takenAction.name];
    action.backward(takenAction.backwardData);
    this.cursor -= 1;
  }

  redo() {
    if (this.cursor + 1 === this.actions.length) return;
    this.cursor += 1;
    const takenAction = this.actions[this.cursor];
    const action = actions[takenAction.name];
    action.forward(takenAction.forwardData);
  }

  deleteStep(step: Step) {
    this.action("DELETE_STEP", {
      step
    });
  }
}
