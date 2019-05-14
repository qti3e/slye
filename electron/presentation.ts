/*
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { promises as fs, createWriteStream } from "fs";
import { ipcMain, IpcMessageEvent, BrowserWindow } from "electron";
import { JSONPresentation, JSONPresentationStep } from "../core/sly";
import { headlessDecode } from "../core/sly/headlessDecoder";
import { encode } from "../core/sly/encoder";
import { actions, Action } from "../core/actions";
import { Sync } from "../core/sync/sync";
import { HeadlessSerializer } from "../core/sync/headlessSerializer";
import uuidv1 from "uuid/v1";
import tar from "tar";
import * as IPC from "../frontend/ipc";
import * as path from "path";
import * as headless from "../core/headless";

type Meta = Record<string, string | number>;

export class PresentationFile {
  lock: boolean;
  localPath: string;
  meta: Meta;
  changes = 0;
  timer: NodeJS.Timeout;
  presentation: headless.HeadlessPresentation;

  constructor(
    public readonly dir: string,
    private readonly uuid: string,
    private readonly window: BrowserWindow
  ) {}

  private join(f: string): string {
    return path.join(this.dir, f);
  }

  private async write(): Promise<void> {
    if (this.lock) return;
    this.lock = true;
    await Promise.all([
      fs.writeFile(this.join("sly.json"), JSON.stringify(this.getSly())),
      fs.writeFile(this.join("meta.json"), JSON.stringify(this.meta))
    ]);
    this.lock = false;
  }

  private change(): void {
    this.changes++;
    this.write();
  }

  private initSly(sly: JSONPresentation): void {
    const pd = this.uuid;
    const window = this.window;
    this.presentation = new headless.HeadlessPresentation(pd);
    const sync = new Sync(
      this.presentation,
      new HeadlessSerializer(),
      {
        onMessage(handler: (msg: string) => void): void {
          ipcMain.on(`p${pd}`, (event: IpcMessageEvent, msg: string) => {
            console.log("Recv", msg);
            handler(msg);
          });
        },
        send(msg: string): void {
          console.log("Send", msg);
          window.webContents.send(`p${pd}`, msg);
        }
      },
      headlessDecode,
      true
    );
    sync.open(sly);
  }

  async init(): Promise<void> {
    this.meta = {
      uuid: this.uuid,
      created: Date.now()
    };

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
                font: { kind: 1, font: "Shellia", moduleName: "slye" }
              }
            }
          ]
        }
      }
    };

    this.initSly(sly);

    await fs.mkdir(this.join("assets")), this.write();
  }

  async patchMeta(meta: Meta): Promise<void> {
    this.meta = {
      ...this.meta,
      ...meta
    };
    this.change();
  }

  getMeta(): Meta {
    return this.meta;
  }

  getSly(): JSONPresentation {
    return encode(this.presentation);
  }

  async pack(path: string): Promise<void> {
    await this.write();
    const dest = createWriteStream(path);
    tar
      .c(
        {
          gzip: true,
          cwd: this.dir
        },
        ["assets", "sly.json", "meta.json"]
      )
      .pipe(dest);
  }

  async unpack(path: string): Promise<void> {
    await tar.x({
      file: path,
      cwd: this.dir,
      sync: true
    });

    const sly = JSON.parse(await fs.readFile(this.join("sly.json"), "utf-8"));
    const meta = JSON.parse(await fs.readFile(this.join("meta.json"), "utf-8"));

    this.meta = meta;
    this.initSly(sly);
  }

  async close(): Promise<void> {
    // TODO(qti3e)
  }
}
