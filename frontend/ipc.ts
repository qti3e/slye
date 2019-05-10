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
  getModuleMainURL(moduleName: string): Promise<string>;
  getModuleAssetURL(moduleName: string, asset: string): Promise<string>;
  getAssetURL(pd: string, asset: string): Promise<string>;
  forwardAction(pd: string, action: string, data: object): void;
  backwardAction(pd: string, action: string, data: object): void;
  save(pd: string): void;
}

export enum MsgKind {
  CREATE,
  CLOSE,
  PATCH_META,
  GET_META,
  FETCH_SLY,
  FORWARD_ACTION,
  BACKWARD_ACTION,
  SAVE
}

export type Request =
  | CreateRequest
  | CloseRequest
  | PatchMetaRequest
  | GetMetaRequest
  | FetchSlyRequest
  | ForwardActionRequest
  | BackwardActionRequest
  | SaveRequest;

export type Response =
  | CreateResponse
  | CloseResponse
  | PatchMetaResponse
  | GetMetaResponse
  | FetchSlyResponse
  | ForwardActionResponse
  | BackwardActionResponse
  | SaveResponse;

export type ResponseData =
  | CreateResponseData
  | CloseResponseData
  | PatchMetaResponseData
  | GetMetaResponseData
  | FetchSlyResponseData
  | ForwardActionResponseData
  | BackwardActionResponseData
  | SaveResponseData;

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

// ACTION DATA

export type SerializedComponent = {
  component: string; // UUID
  data?: {
    moduleName: string;
    componentName: string;
    props: ActionData;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
};

export type SerializedStep = {
  step: string; // UUID
  data?: {
    components: SerializedComponent[];
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
};

export type SerializedActionData =
  | string
  | number
  | boolean
  | SerializedComponent
  | SerializedStep
  | { font: { moduleName: string; name: string } }
  | { _: ActionData }; // For nested data.

export type ActionData = {
  [K: string]: SerializedActionData;
};

// === FORWARD_ACTION
export interface ForwardActionRequest extends RequestBase {
  kind: MsgKind.FORWARD_ACTION;
  presentationDescriptor: string;
  action: string;
  data: ActionData;
}

export interface ForwardActionResponse extends ResponseBase {
  kind: MsgKind.FORWARD_ACTION;
  data: ForwardActionResponseData;
}

export interface ForwardActionResponseData {
  ok: true;
}

// === BACKWARD_ACTION
export interface BackwardActionRequest extends RequestBase {
  kind: MsgKind.BACKWARD_ACTION;
  presentationDescriptor: string;
  action: string;
  data: ActionData;
}

export interface BackwardActionResponse extends ResponseBase {
  kind: MsgKind.BACKWARD_ACTION;
  data: BackwardActionResponseData;
}

export interface BackwardActionResponseData {
  ok: true;
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
