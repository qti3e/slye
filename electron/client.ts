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
import * as types from "../frontend/ipc";

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

  private sendRequest<
    T extends Pick<types.RequestBase, Exclude<keyof types.RequestBase, "id">>,
    V = (types.Response & { kind: T["kind"] })["data"]
  >(req: T): Promise<V> {
    const id = this.lastReqId++;
    const promise = new Promise<V>(resolve => {
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
    return this.sendRequest({
      kind: types.MsgKind.CREATE
    });
  }
}
