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
import * as types from "../frontend/ipc";

export class Server {
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
    const data = await this[req.kind](req);
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
    const uuid = "XXX";
    return {
      presentationDescriptor: uuid
    };
  }
}
