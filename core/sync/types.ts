/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { JSONPresentation } from "../sly/types";
import { Context } from "./serializer/types";
import { ActionTypes } from "../actions";

export interface SyncChannel {
  send(msg: string): void;
  onMessage(handler: (msg: string) => void): void;
}

export interface Serializer {
  readonly ctx: Context;
  serialize(forward: boolean, action: keyof ActionTypes, data: any): string;
  unserialize(text: string): Promise<any>;
}

export type SyncCommand = SyncSlyCommand | SyncActionCommand | SyncSlyResponse;

export interface SyncSlyCommand {
  command: "sly";
  pd: string;
}

export interface SyncSlyResponse {
  command: "sly_response";
  sly: JSONPresentation;
}

export interface SyncActionCommand {
  command: "action";
  action: any;
}
