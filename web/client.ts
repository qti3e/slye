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
import { ee, presentations, Presentation } from "./presentation";
import * as types from "../frontend/ipc";
import uuidv1 from "uuid/v1";

export class Client implements types.Client {
  async create(): Promise<types.CreateResponseData> {
    const sly: any = {
      template: {
        moduleName: "slye",
        component: "template"
      },
      steps: {
        [uuidv1()]: {
          position: [-110, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          components: [
            {
              uuid: uuidv1(),
              moduleName: "slye",
              component: "text",
              position: [
                -15.20454158717898,
                0.4664170368873606,
                17.052472519411943
              ],
              rotation: [-0.9999961802122638, 0, 0],
              scale: [1, 1, 0.15397232016921775],
              props: {
                text: "Slye",
                size: 20,
                color: 15409268,
                font: {
                  kind: 1,
                  font: "Shellia",
                  fileUUID: "shellia.ttf",
                  moduleId: "slye"
                }
              }
            }
          ]
        }
      }
    };

    const presentation = new Presentation();
    presentation.open(sly);

    return {
      presentationDescriptor: presentation.uuid
    };
  }

  async close(
    presentationDescriptor: string
  ): Promise<types.CloseResponseData> {
    throw new Error("Not implemented.");
  }

  async patchMeta(
    presentationDescriptor: string,
    meta: types.Meta
  ): Promise<types.PatchMetaResponseData> {
    const p = presentations.get(presentationDescriptor);
    p.patchMeta(meta);
    return {
      ok: true
    };
  }

  async getMeta(
    presentationDescriptor: string
  ): Promise<types.GetMetaResponseData> {
    const p = presentations.get(presentationDescriptor);
    return {
      meta: p.meta
    };
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

  showFileDialog(
    presentationDescriptor: string
  ): Promise<types.ShowFileDialogResponseData> {
    let resolve: (data: any) => void;
    const promise = new Promise<types.ShowFileDialogResponseData>(
      r => (resolve = r)
    );
    const presentation = presentations.get(presentationDescriptor);

    const input = document.createElement("input");
    input.type = "file";
    input.onchange = () => {
      const files = input.files;
      const retFiles = [];

      for (let i = 0; i < files.length; ++i) {
        const uuid = uuidv1();
        const url = URL.createObjectURL(files[i]);
        presentation.assets.set(uuid, url);
        retFiles.push(uuid);
      }

      resolve({
        files: retFiles
      });
    };
    input.click();

    return promise;
  }

  async getModuleMainURL(moduleName: string): Promise<string> {
    if (moduleName !== "slye")
      throw new Error("Non-default modules are not supported.");
    return `./modules/${moduleName}/main.js`;
  }

  async getModuleAssetURL(moduleName: string, asset: string): Promise<string> {
    if (moduleName !== "slye")
      throw new Error("Non-default modules are not supported.");
    return `./modules/${moduleName}/assets/${asset}`;
  }

  async getAssetURL(pd: string, asset: string): Promise<string> {
    const presentation = presentations.get(pd);
    const url = presentation.assets.get(asset);
    return url;
  }

  syncChannelOnMessage(pd: string, handler: (msg: string) => void): void {
    ee.on(`p${pd}-x`, (msg: string) => {
      handler(msg);
    });
  }

  syncChannelSend(pd: string, msg: string): void {
    ee.emit(`p${pd}`, msg);
  }
}

window["client"] = new Client();
