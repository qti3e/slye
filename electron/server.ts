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
import { dialog, ipcMain, IpcMessageEvent, BrowserWindow } from "electron";
import { PresentationFile, presentations } from "./presentation";
import uuidv1 from "uuid/v1";
import * as tmp from "tmp";
import * as path from "path";
import * as types from "../frontend/ipc";

type ServerInterface = {
  [key in types.MsgKind]: (req: unknown) => Promise<unknown>
};

export class Server implements ServerInterface {
  constructor(private window: BrowserWindow) {
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
    event.sender.send("asynchronous-reply", res);
  }

  async [types.MsgKind.CREATE](
    req: types.CreateRequest
  ): Promise<types.CreateResponseData> {
    const uuid = uuidv1();
    const dir = tmp.dirSync({ prefix: "slye-" }).name;
    const presentation = new PresentationFile(dir, uuid, this.window);
    await presentation.init();
    presentations.set(uuid, presentation);
    return {
      presentationDescriptor: uuid
    };
  }

  async [types.MsgKind.CLOSE](
    req: types.CloseRequest
  ): Promise<types.CloseResponseData> {
    const p = presentations.get(req.presentationDescriptor);
    p.close();
    presentations.delete(req.presentationDescriptor);
    return {
      ok: true
    };
  }

  async [types.MsgKind.PATCH_META](
    req: types.PatchMetaRequest
  ): Promise<types.PatchMetaResponseData> {
    const p = presentations.get(req.presentationDescriptor);
    p.patchMeta(req.meta);
    return {
      ok: true
    };
  }

  async [types.MsgKind.GET_META](
    req: types.GetMetaRequest
  ): Promise<types.GetMetaResponseData> {
    const p = presentations.get(req.presentationDescriptor);
    const meta = p.getMeta();
    return {
      meta
    };
  }

  async [types.MsgKind.FETCH_SLY](
    req: types.FetchSlyRequest
  ): Promise<types.FetchSlyResponseData> {
    const p = presentations.get(req.presentationDescriptor);
    const presentation = p.getSly();
    return {
      presentation
    };
  }

  async [types.MsgKind.SAVE](
    req: types.SaveRequest
  ): Promise<types.SaveResponseData> {
    const presentation = presentations.get(req.presentationDescriptor);
    if (!presentation.localPath) {
      presentation.localPath = dialog.showSaveDialog(this.window, {
        title: "Slye",
        filters: [
          {
            name: "Slye Presentation",
            extensions: ["sly"]
          }
        ]
      });
    }
    if (!presentation.localPath) return { ok: false, canceled: true };
    presentation.pack(presentation.localPath);
  }

  async [types.MsgKind.OPEN](
    req: types.OpenRequest
  ): Promise<types.OpenResponseData> {
    const path = dialog.showOpenDialog(this.window, {
      title: "Slye",
      filters: [
        {
          name: "Slye Presentation",
          extensions: ["sly"]
        }
      ],
      properties: ["openFile"]
    });

    if (!path || !path.length) return { ok: false };

    try {
      const uuid = await this.openFile(path[0]);
      return { ok: true, presentationDescriptor: uuid };
    } catch (e) {
      console.error(e);
      return { ok: false };
    }
  }

  async [types.MsgKind.SHOW_FILE_DIALOG](
    req: types.ShowFileDialogRequest
  ): Promise<types.ShowFileDialogResponseData> {
    const paths = dialog.showOpenDialog(this.window, {
      title: "Select a file",
      properties: ["openFile"]
    });

    if (!paths || !paths.length) return { files: [] };

    const presentation = presentations.get(req.presentationDescriptor);
    const files: string[] = [];

    for (let i = 0; i < paths.length; ++i) {
      const uuid = uuidv1();
      const file = path.join(presentation.dir, "assets/", uuid);
      console.log("CP", paths[i], file);
      await fs.copyFile(paths[i], file);
      files.push(uuid);
    }

    return { files };
  }

  async openFile(path: string): Promise<string> {
    const uuid = uuidv1();
    const dir = tmp.dirSync({ prefix: "slye-" }).name;
    const presentation = new PresentationFile(dir, uuid, this.window);
    presentation.localPath = path;
    await presentation.unpack(path);
    presentations.set(uuid, presentation);
    return uuid;
  }
}
