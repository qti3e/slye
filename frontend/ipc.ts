/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

// Types for client and server.

export interface Client {
  create(): Promise<CreateResponseData>;
}

export enum MsgKind {
  CREATE
}

export type Request = CreateRequest;

export type Response = CreateResponse;

export type ResponseData = CreateResponseData;

export interface RequestBase {
  kind: MsgKind;
  id: number;
}

export interface ResponseBase {
  kind: MsgKind;
  id: number;
  data: ResponseData;
}

// === Create

export interface CreateRequest extends RequestBase {
  kind: MsgKind.CREATE;
}

export interface CreateResponse extends ResponseBase {
  kind: MsgKind.CREATE;
  data: CreateResponseData;
}

export interface CreateResponseData {
  presentationDescriptor: string;
}

// ===
