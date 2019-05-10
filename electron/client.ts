/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { ipcRenderer, IpcMessageEvent } from "electron";
import { JSONPresentationStep } from "@slye/core/sly";
import * as types from "../frontend/ipc";

const sentToServer: Map<string, true> = new Map();

export class Client implements types.Client {
  private readonly resolves: Map<number, any> = new Map();
  private lastReqId: number = 0;

  constructor() {
    ipcRenderer.on(
      "asynchronous-reply",
      (event: IpcMessageEvent, res: types.Response) => {
        if (res && Object.prototype.hasOwnProperty.call(res, "kind")) {
          this.handleResponse(res);
        }
      }
    );
  }

  private handleResponse(res: types.Response): void {
    const id = res.id;
    const resolve = this.resolves.get(id);
    this.resolves.delete(id);
    if (!resolve) throw new Error("Multiple response for a single request.");
    resolve(res.data);
  }

  // TODO(qti3e) Typing on this function can be improved or simpilfied.
  private sendRequest<
    R extends types.Request,
    D extends types.ResponseData,
    T = Pick<R, Exclude<keyof R, "id">>
  >(req: T): Promise<D> {
    const id = this.lastReqId++;
    const promise = new Promise<D>(resolve => {
      this.resolves.set(id, resolve);
    });
    // Set the id & send the message.
    (req as any).id = id;
    ipcRenderer.send("asynchronous-message", req);
    return promise;
  }

  /**
   * Create a new presentation.
   */
  create(): Promise<types.CreateResponseData> {
    return this.sendRequest<types.CreateRequest, types.CreateResponseData>({
      kind: types.MsgKind.CREATE
    });
  }

  close(presentationDescriptor: string): Promise<types.CloseResponseData> {
    return this.sendRequest<types.CloseRequest, types.CloseResponseData>({
      kind: types.MsgKind.CLOSE,
      presentationDescriptor
    });
  }

  patchMeta(
    presentationDescriptor: string,
    meta: types.Meta
  ): Promise<types.PatchMetaResponseData> {
    return this.sendRequest<
      types.PatchMetaRequest,
      types.PatchMetaResponseData
    >({
      kind: types.MsgKind.PATCH_META,
      presentationDescriptor,
      meta
    });
  }

  getMeta(presentationDescriptor: string): Promise<types.GetMetaResponseData> {
    return this.sendRequest<types.GetMetaRequest, types.GetMetaResponseData>({
      kind: types.MsgKind.GET_META,
      presentationDescriptor
    });
  }

  async fetchSly(
    presentationDescriptor: string
  ): Promise<types.FetchSlyResponseData> {
    const res = await this.sendRequest<
      types.FetchSlyRequest,
      types.FetchSlyResponseData
    >({
      kind: types.MsgKind.FETCH_SLY,
      presentationDescriptor
    });

    const { presentation } = res;
    for (const stepUUID in presentation.steps) {
      const step = presentation.steps[stepUUID];
      sentToServer.set(stepUUID, true);
      for (const component of step.components) {
        sentToServer.set(component.uuid, true);
      }
    }

    return res;
  }

  forwardAction(
    presentationDescriptor: string,
    action: string,
    forwardData: object
  ): Promise<types.ForwardActionResponseData> {
    return this.sendRequest<
      types.ForwardActionRequest,
      types.ForwardActionResponseData
    >({
      kind: types.MsgKind.FORWARD_ACTION,
      presentationDescriptor,
      action,
      data: serializeActionData(forwardData)
    });
  }

  backwardAction(
    presentationDescriptor: string,
    action: string,
    backwardData: object
  ): Promise<types.BackwardActionResponseData> {
    return this.sendRequest<
      types.BackwardActionRequest,
      types.BackwardActionResponseData
    >({
      kind: types.MsgKind.BACKWARD_ACTION,
      presentationDescriptor,
      action,
      data: serializeActionData(backwardData)
    });
  }

  save(presentationDescriptor: string): Promise<types.SaveResponseData> {
    return this.sendRequest<types.SaveRequest, types.SaveResponseData>({
      kind: types.MsgKind.SAVE,
      presentationDescriptor
    });
  }

  open(): Promise<types.OpenResponseData> {
    return this.sendRequest<types.OpenRequest, types.OpenResponseData>({
      kind: types.MsgKind.OPEN
    });
  }

  async getModuleMainURL(moduleName: string): Promise<string> {
    return `slye://modules/${moduleName}/main.js`;
  }

  async getModuleAssetURL(moduleName: string, asset: string): Promise<string> {
    return `slye://modules/${moduleName}/assets/${asset}`;
  }

  async getAssetURL(pd: string, asset: string): Promise<string> {
    return `slye://presentation-assets/${pd}/${asset}`;
  }
}

function serializeComponent(val: any): types.SerializedComponent {
  if (sentToServer.has(val.uuid)) {
    return { component: val.uuid };
  } else {
    sentToServer.set(val.uuid, true);
    const { x: px, y: py, z: pz } = val.getPosition();
    const { x: rx, y: ry, z: rz } = val.getRotation();
    const { x: sx, y: sy, z: sz } = val.getScale();
    return {
      component: val.uuid,
      data: {
        moduleName: val.moduleName,
        componentName: val.componentName,
        props: serializeActionData(val.props),
        position: [px, py, pz],
        rotation: [rx, ry, rz],
        scale: [sx, sy, sz]
      }
    };
  }
}

function serializeActionData(data: object): types.ActionData {
  const ret: types.ActionData = {};

  for (const key in data) {
    const val = (data as any)[key];
    if (
      typeof val === "string" ||
      typeof val === "number" ||
      typeof val === "boolean"
    ) {
      ret[key] = val;
    } else if (val.isSlyeComponent) {
      ret[key] = serializeComponent(val);
    } else if (val.isSlyeStep) {
      if (sentToServer.has(val.uuid)) {
        ret[key] = { step: val.uuid };
      } else {
        sentToServer.set(val.uuid, true);
        const { x: px, y: py, z: pz } = val.getPosition();
        const { x: rx, y: ry, z: rz } = val.getRotation();
        const { x: sx, y: sy, z: sz } = val.getScale();
        ret[key] = {
          step: val.uuid,
          data: {
            components: val.components.map(serializeComponent),
            position: [px, py, pz],
            rotation: [rx, ry, rz],
            scale: [sx, sy, sz]
          }
        };
      }
    } else if (val.isSlyeFont) {
      ret[key] = { font: { moduleName: val.moduleName, name: val.name } };
    } else if (val.isSlyePresentation) {
      ret[key] = { presentation: val.uuid };
    } else {
      ret[key] = { _: serializeActionData(val) };
    }
  }

  return ret;
}
