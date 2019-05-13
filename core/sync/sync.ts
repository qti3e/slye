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
import { encode } from "../sly/encoder";
import { Serializer } from "./serializer";
import { actions, ActionTypes } from "../actions";

/**
 * An API to keep a presentations sync over a channel.
 */
export class Sync {
  private resolves: (() => void)[] = [];

  constructor(
    readonly presentation: PresentationBase,
    readonly serializer: Serializer,
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

  async open(sly: JSONPresentation): Promise<void> {
    // TODO(qti3e) We need to ensure it is only called once.
    await this.slyDecoder(this.presentation, sly, {
      onComponent: (component: ComponentBase): void => {
        this.serializer.components.set(component.uuid, component);
      },
      onStep: (step: StepBase): void => {
        this.serializer.steps.set(step.uuid, step);
      }
    });
    this.resolves.map(r => r());
    this.resolves = [];
  }

  waitForOpen(): Promise<void> {
    const promise = new Promise<void>(r => this.resolves.push(r));
    return promise;
  }

  private send(command: SyncCommand): void {
    this.ch.send(JSON.stringify(command));
  }

  private onMessage(msg: string): void {
    // For now it just works but we need an handshake process.
    const cmd: SyncCommand = JSON.parse(msg);
    switch (cmd.command) {
      case "sly":
        this.handleSly();
        break;
      case "sly_response":
        this.open(cmd.sly);
        break;
      case "action":
        this.handleAction(cmd.action);
        break;
    }
  }

  private handleSly(): void {
    this.send({
      command: "sly_response",
      sly: encode(this.presentation)
    });
  }

  private async handleAction(text: string): Promise<void> {
    const raw = await this.serializer.unserialize(text);
    const action = actions[raw.action][raw.forward ? "forward" : "backward"];
    action(this.presentation, raw.data);
  }

  private load(): void {
    const presentationDescriptor = this.presentation.uuid;
    this.send({
      command: "sly",
      pd: presentationDescriptor
    });
  }

  private onChange(
    forward: boolean,
    actionName: keyof ActionTypes,
    data: any
  ): void {
    const action = this.serializer.serialize(forward, actionName, data);
    this.send({
      command: "action",
      action
    });
  }
}
