/*
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { ipcMain, IpcMessageEvent, BrowserWindow } from "electron";
import { PresentationFile } from "./presentation";
import uuidv1 from "uuid/v1";
import { createDir } from "mktemp";
import * as types from "../frontend/ipc";

export class Server {
  private readonly presentations: Map<string, PresentationFile> = new Map();

  constructor(private readonly window: BrowserWindow) {
    ipcMain.on(
      "asynchronous-message",
      (event: IpcMessageEvent, req: types.Request) => {
        if (req && Object.prototype.hasOwnProperty.call(req, "kind")) {
          this.handleRequest(req);
        }
      }
    );
  }

  private async handleRequest(req: types.Request): Promise<void> {
    const data = await (this[req.kind] as any)(req);
    const res = {
      kind: types.MsgKind.CREATE,
      id: req.id,
      data
    };
    this.window.webContents.send("asynchronous-reply", res);
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
    return {};
  }
}
