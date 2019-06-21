/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { JSONPresentationStep } from "@slye/core/sly";
import * as types from "../frontend/ipc";

export class Client implements types.Client {
  async create(): Promise<types.CreateResponseData> {
    return {
      presentationDescriptor: "xxx"
    };
  }

  async close(
    presentationDescriptor: string
  ): Promise<types.CloseResponseData> {
    return {
      ok: true
    };
  }

  async patchMeta(
    presentationDescriptor: string,
    meta: types.Meta
  ): Promise<types.PatchMetaResponseData> {
    throw new Error("Not implemented.");
  }

  async getMeta(
    presentationDescriptor: string
  ): Promise<types.GetMetaResponseData> {
    throw new Error("Not implemented.");
  }

  async fetchSly(
    presentationDescriptor: string
  ): Promise<types.FetchSlyResponseData> {
    throw new Error("Not implemented.");
  }

  async save(presentationDescriptor: string): Promise<types.SaveResponseData> {
    throw new Error("Not implemented.");
  }

  async open(): Promise<types.OpenResponseData> {
    throw new Error("Not implemented.");
  }

  async showFileDialog(
    presentationDescriptor: string
  ): Promise<types.ShowFileDialogResponseData> {
    throw new Error("Not implemented.");
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

  syncChannelOnMessage(pd: string, handler: (msg: string) => void): void {
    throw new Error("Not implemented.");
  }

  syncChannelSend(pd: string, msg: string): void {
    throw new Error("Not implemented.");
  }
}

window["client"] = new Client();
