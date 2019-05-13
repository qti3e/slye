/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import * as sly from "@slye/core/sly";

// Types for client and server.

export type Meta = Record<string, string | number>;

export interface Client {
  create(): Promise<CreateResponseData>;
  close(pd: string): Promise<CloseResponseData>;
  patchMeta(pd: string, meta: Meta): Promise<PatchMetaResponseData>;
  getMeta(pd: string): Promise<GetMetaResponseData>;
  fetchSly(pd: string): Promise<FetchSlyResponseData>;
  save(pd: string): Promise<SaveResponseData>;
  open(): Promise<OpenResponseData>;

  syncChannelSend(pd: string, msg: string): void;
  syncChannelOnMessage(pd: string, handler: (msg: string) => void): void;

  getModuleMainURL(moduleName: string): Promise<string>;
  getModuleAssetURL(moduleName: string, asset: string): Promise<string>;
  getAssetURL(pd: string, asset: string): Promise<string>;
}

export enum MsgKind {
  CREATE,
  CLOSE,
  PATCH_META,
  GET_META,
  FETCH_SLY,
  SAVE,
  OPEN
}

export type Request =
  | CreateRequest
  | CloseRequest
  | PatchMetaRequest
  | GetMetaRequest
  | FetchSlyRequest
  | SaveRequest
  | OpenRequest;

export type Response =
  | CreateResponse
  | CloseResponse
  | PatchMetaResponse
  | GetMetaResponse
  | FetchSlyResponse
  | SaveResponse
  | OpenResponse;

export type ResponseData =
  | CreateResponseData
  | CloseResponseData
  | PatchMetaResponseData
  | GetMetaResponseData
  | FetchSlyResponseData
  | SaveResponseData
  | OpenResponseData;

export interface RequestBase {
  kind: MsgKind;
  id: number;
}

export interface ResponseBase {
  kind: MsgKind;
  id: number;
  data: ResponseData;
}

// === CREATE
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

// === CLOSE
export interface CloseRequest extends RequestBase {
  kind: MsgKind.CLOSE;
  presentationDescriptor: string;
}

export interface CloseResponse extends ResponseBase {
  kind: MsgKind.CLOSE;
  data: CloseResponseData;
}

export interface CloseResponseData {
  ok: true;
}

// === PATCH_META
export interface PatchMetaRequest extends RequestBase {
  kind: MsgKind.PATCH_META;
  presentationDescriptor: string;
  meta: Meta;
}

export interface PatchMetaResponse extends ResponseBase {
  kind: MsgKind.PATCH_META;
  data: PatchMetaResponseData;
}

export interface PatchMetaResponseData {
  ok: true;
}

// === GET_META
export interface GetMetaRequest extends RequestBase {
  kind: MsgKind.GET_META;
  presentationDescriptor: string;
}

export interface GetMetaResponse extends ResponseBase {
  kind: MsgKind.GET_META;
  data: GetMetaResponseData;
}

export interface GetMetaResponseData {
  meta: Meta;
}

// === FETCH_SLY
export interface FetchSlyRequest extends RequestBase {
  kind: MsgKind.FETCH_SLY;
  presentationDescriptor: string;
}

export interface FetchSlyResponse extends ResponseBase {
  kind: MsgKind.FETCH_SLY;
  data: FetchSlyResponseData;
}

export interface FetchSlyResponseData {
  presentation: sly.JSONPresentation;
}

// === SAVE
export interface SaveRequest extends RequestBase {
  kind: MsgKind.SAVE;
  presentationDescriptor: string;
}

export interface SaveResponse extends ResponseBase {
  kind: MsgKind.SAVE;
  data: SaveResponseData;
}

export interface SaveResponseData {
  ok: boolean;
  canceled?: boolean;
}

// === OPEN
export interface OpenRequest extends RequestBase {
  kind: MsgKind.OPEN;
}

export interface OpenResponse extends ResponseBase {
  kind: MsgKind.OPEN;
  data: OpenResponseData;
}

export interface OpenResponseData {
  ok: boolean;
  presentationDescriptor?: string;
}
