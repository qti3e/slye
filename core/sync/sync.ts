/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { PresentationBase, StepBase, ComponentBase } from "../interfaces";
import { ActionStack } from "../actionStack";
import { SyncChannel } from "./channel";
import { SyncCommand } from "./common";
import { SlyDecoder, JSONPresentation } from "../sly/types";
import { serialize } from "./serializer";

/**
 * An API to keep a presentations sync over a channel.
 */
export class Sync {
  constructor(
    readonly presentation: PresentationBase,
    private readonly ch: SyncChannel,
    private readonly slyDecoder: SlyDecoder,
    readonly isServer = false
  ) {
    if (!this.isServer) this.load();

    this.onMessage = this.onMessage.bind(this);
    this.onChange = this.onChange.bind(this);

    this.ch.onMessage(this.onMessage);
  }

  bind(actionStack: ActionStack): void {
    if (actionStack.listener === this.onChange) return;
    if (actionStack.listener)
      throw new Error("ActionStack is already binded to another Sync.");
    actionStack.listener = this.onChange;
  }

  private send(command: SyncCommand): void {
    this.ch.send(JSON.stringify(command));
  }

  private onMessage(msg: string): void {
    const cmd = JSON.parse(msg);
    switch (cmd.command) {
      case "sly":
        this.handleSly(cmd.sly);
        break;
      case "action":
    }
  }

  private handleSly(sly: JSONPresentation): void {
    this.slyDecoder(this.presentation, sly, {
      onComponent: (component: ComponentBase): void => {
        this.components.set(component.uuid, component);
      },
      onStep: (step: StepBase): void => {
        this.steps.set(step.uuid, step);
      }
    });
  }

  private load(): void {
    const presentationDescriptor = this.presentation.uuid;
    this.send({
      command: "sly",
      pd: presentationDescriptor
    });
  }

  private onChange(forward: boolean, action: string, data: any): void {
    this.send({
      command: "action",
      action: serialize(this.steps, this.components, forward, action, data)
    });
  }
}
