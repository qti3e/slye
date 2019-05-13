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
import uuidv1 from "uuid/v1";
import tar from "tar";
import { JSONPresentation, JSONPresentationStep } from "../core/sly";
import { headlessDecode } from "../core/sly/headlessDecoder";
import { encode } from "../core/sly/encoder";
import { actions, Action } from "../core/actions";
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

  components: Map<string, headless.HeadlessComponent> = new Map();
  steps: Map<string, headless.HeadlessStep> = new Map();
  fonts: headless.HeadlessFont[] = [];

  constructor(public readonly dir: string, private readonly uuid: string) {}

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

  // Public Interface.

  close(): void {
    // Remove dir.
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

    this.presentation = new headless.HeadlessPresentation(this.uuid);
    headlessDecode(this.presentation, sly, {
      onComponent: (component: headless.HeadlessComponent): void => {
        this.components.set(component.uuid, component);
      },
      onStep: (step: headless.HeadlessStep): void => {
        this.steps.set(step.uuid, step);
      }
    });

    await Promise.all([
      fs.mkdir(this.join("assets")),
      fs.writeFile(this.join("sly.json"), JSON.stringify(this.getSly())),
      fs.writeFile(this.join("meta.json"), JSON.stringify(this.meta))
    ]);
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

    this.presentation = new headless.HeadlessPresentation(this.uuid);
    headlessDecode(this.presentation, sly, {
      onComponent: (component: headless.HeadlessComponent): void => {
        this.components.set(component.uuid, component);
      },
      onStep: (step: headless.HeadlessStep): void => {
        this.steps.set(step.uuid, step);
      }
    });
  }
}
