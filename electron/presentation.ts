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
import uuidv1 from "uuid/v1";
import * as path from "path";
import { JSONPresentation, JSONPresentationStep } from "../core/sly";
import { shortId } from "../core/util";

type Meta = Record<string, string | number>;

export class PresentationFile {
  meta: Meta;
  sly: JSONPresentation;
  lock: boolean;
  changes = 0;
  timer: NodeJS.Timeout;

  constructor(public readonly dir: string, private readonly uuid: string) {}

  private join(f: string): string {
    return path.join(this.dir, f);
  }

  private async write(): Promise<void> {
    if (this.lock) return;
    this.lock = true;
    await Promise.all([
      fs.writeFile(this.join("sly.json"), JSON.stringify(this.sly)),
      fs.writeFile(this.join("meta.json"), JSON.stringify(this.meta))
    ]);
    this.lock = false;
  }

  private change(): void {
    this.changes++;
    if (this.changes % 3) {
      this.write();
    } else {
      clearTimeout(this.timer);
      this.timer = setTimeout(this.write, 2000);
    }
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
    this.sly = {
      template: {
        moduleName: "slye",
        component: "template"
      },
      steps: {
        [uuidv1()]: {
          position: [-110, 0, 0] as any,
          rotation: [0, 0, 0] as any,
          scale: [1, 1, 1] as any,
          components: [
            {
              id: shortId(),
              moduleName: "slye",
              component: "text",
              position: [-30, 10, 0] as any,
              rotation: [0, 0, 0] as any,
              scale: [1, 1, 1] as any,
              props: {
                text: "What is",
                size: 10,
                font: {
                  kind: 1,
                  moduleName: "slye",
                  font: "Sahel"
                }
              }
            },
            {
              id: shortId(),
              moduleName: "slye",
              component: "text",
              position: [0, -5, 0] as any,
              rotation: [0, 0, 0] as any,
              scale: [1, 1, 1] as any,
              props: {
                text: "Slye",
                size: 20,
                font: {
                  kind: 1,
                  moduleName: "slye",
                  font: "Shellia"
                }
              }
            },
            {
              id: shortId(),
              moduleName: "slye",
              component: "text",
              position: [29, -15, 0] as any,
              rotation: [0, 0, 0] as any,
              scale: [1, 1, 1] as any,
              props: {
                text: "!!!",
                size: 10,
                font: {
                  kind: 1,
                  moduleName: "slye",
                  font: "Sahel"
                }
              }
            }
          ]
        },
        [uuidv1()]: {
          position: [-120, 0, 0] as any,
          rotation: [0, 0, 0] as any,
          scale: [1, 1, 1] as any,
          components: [
            {
              id: shortId(),
              moduleName: "slye",
              component: "text",
              position: [-30, 10, 0] as any,
              rotation: [0, 0, 0] as any,
              scale: [1, 1, 1] as any,
              props: {
                text: "What is",
                size: 10,
                font: {
                  kind: 1,
                  moduleName: "slye",
                  font: "Sahel"
                }
              }
            },
            {
              id: shortId(),
              moduleName: "slye",
              component: "text",
              position: [0, -5, 0] as any,
              rotation: [0, 0, 0] as any,
              scale: [1, 1, 1] as any,
              props: {
                text: "Slye",
                size: 20,
                font: {
                  kind: 1,
                  moduleName: "slye",
                  font: "Shellia"
                }
              }
            },
            {
              id: shortId(),
              moduleName: "slye",
              component: "text",
              position: [29, -15, 0] as any,
              rotation: [0, 0, 0] as any,
              scale: [1, 1, 1] as any,
              props: {
                text: "?",
                size: 10,
                font: {
                  kind: 1,
                  moduleName: "slye",
                  font: "Sahel"
                }
              }
            }
          ]
        }
      }
    };
    await Promise.all([
      fs.mkdir(this.join("assets")),
      fs.writeFile(this.join("sly.json"), JSON.stringify(this.sly)),
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

  patchStep(uuid: string, step: Partial<JSONPresentationStep>): void {
    this.sly.steps[uuid] = {
      ...this.sly.steps[uuid],
      ...step
    };
    this.change();
  }

  getSly(): JSONPresentation {
    return this.sly;
  }
}
