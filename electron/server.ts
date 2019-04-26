/*
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { promises as fs } from "fs";
import { ipcMain, IpcMessageEvent, BrowserWindow } from "electron";
import { PresentationFile } from "./presentation";
import uuidv1 from "uuid/v1";
import { createDir } from "mktemp";
import * as path from "path";
import * as types from "../frontend/ipc";

type ServerInterface = {
  [key in types.MsgKind]: (req: unknown) => Promise<unknown>
};

export class Server implements ServerInterface {
  private readonly presentations: Map<string, PresentationFile> = new Map();

  constructor() {
    ipcMain.on(
      "asynchronous-message",
      (event: IpcMessageEvent, req: types.Request) => {
        if (req && Object.prototype.hasOwnProperty.call(req, "kind")) {
          this.handleRequest(event, req);
        }
      }
    );
  }

  private async handleRequest(
    event: IpcMessageEvent,
    req: types.Request
  ): Promise<void> {
    const fn = (this as any)[req.kind];
    const data = fn ? await (this as any)[req.kind](req) : undefined;
    const res = {
      kind: req.kind,
      id: req.id,
      data
    };
    console.log(res);
    event.sender.send("asynchronous-reply", res);
  }

  async [types.MsgKind.CREATE](
    req: types.CreateRequest
  ): Promise<types.CreateResponseData> {
    const uuid = uuidv1();
    const dir = await createDir("slye-XXXXX");
    const presentation = new PresentationFile(dir, uuid);
    await presentation.init();
    this.presentations.set(uuid, presentation);
    return {
      presentationDescriptor: uuid
    };
  }

  async [types.MsgKind.CLOSE](
    req: types.CloseRequest
  ): Promise<types.CloseResponseData> {
    const p = this.presentations.get(req.presentationDescriptor);
    p.close();
    this.presentations.delete(req.presentationDescriptor);
    return {
      ok: true
    };
  }

  async [types.MsgKind.PATCH_META](
    req: types.PatchMetaRequest
  ): Promise<types.PatchMetaResponseData> {
    const p = this.presentations.get(req.presentationDescriptor);
    p.patchMeta(req.meta);
    return {
      ok: true
    };
  }

  async [types.MsgKind.GET_META](
    req: types.GetMetaRequest
  ): Promise<types.GetMetaResponseData> {
    const p = this.presentations.get(req.presentationDescriptor);
    const meta = p.getMeta();
    return {
      meta
    };
  }

  async [types.MsgKind.PATCH_STEP](
    req: types.PatchStepRequest
  ): Promise<types.PatchStepResponseData> {
    const p = this.presentations.get(req.presentationDescriptor);
    p.patchStep(req.step);
    return {
      ok: true
    };
  }

  async [types.MsgKind.FETCH_SLY](
    req: types.FetchSlyRequest
  ): Promise<types.FetchSlyResponseData> {
    const p = this.presentations.get(req.presentationDescriptor);
    const presentation = p.getSly();
    return {
      presentation
    };
  }

  // There is no need to this message to the server.
  async [types.MsgKind.FETCH_WASM](
    req: types.FetchWAsmRequest
  ): Promise<types.FetchWAsmResponseData> {
    const { moduleName } = req;
    const url = `slye://modules/${moduleName}/main.wasm`;
    return {
      url
    };
  }

  async [types.MsgKind.FETCH_MODULE_ASSET](
    req: types.FetchModuleAssetRequest
  ): Promise<types.FetchAssetResponseData> {
    const { moduleName, assetName } = req;
    // TODO(qti3e)
    const ab: ArrayBuffer = undefined;
    return {
      ab
    };
  }

  async [types.MsgKind.FETCH_ASSET](
    req: types.FetchAssetRequest
  ): Promise<types.FetchAssetResponseData> {
    const p = this.presentations.get(req.presentationDescriptor);
    const ab = await p.getAsset(req.assetId);
    return {
      ab
    };
  }
}
