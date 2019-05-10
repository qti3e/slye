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

    const sly = {
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
              uuid: uuidv1(),
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
              uuid: uuidv1(),
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
              uuid: uuidv1(),
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

  decodeComponent(c: IPC.SerializedComponent): headless.HeadlessComponent {
    const { data, component: uuid } = c;
    if (!data) return this.components.get(uuid);

    const component = new headless.HeadlessComponent(
      uuid,
      data.moduleName,
      data.componentName,
      this.decodeActionData(data.props)
    );
    component.setPosition(...data.position);
    component.setRotation(...data.rotation);
    component.setScale(...data.scale);
    this.components.set(uuid, component);

    return component;
  }

  decodeStep(c: IPC.SerializedStep): headless.HeadlessStep {
    const { data, step: uuid } = c;
    if (!data) return this.steps.get(uuid);

    const step = new headless.HeadlessStep(uuid);
    step.setPosition(...data.position);
    step.setRotation(...data.rotation);
    step.setScale(...data.scale);
    data.components.map(this.decodeComponent).map(step.add);
    this.steps.set(uuid, step);

    return step;
  }

  decodeActionData(data: IPC.ActionData): any {
    const ret: Record<string, any> = {};

    for (const key in data) {
      const val = data[key] as any;

      if (
        typeof val === "string" ||
        typeof val === "number" ||
        typeof val === "boolean"
      ) {
        ret[key] = val;
      } else if (val.component) {
        ret[key] = this.decodeComponent(val);
      } else if (val.step) {
        ret[key] = this.decodeStep(val);
      } else if (val.font) {
        const { moduleName, name } = val.font;
        const font = this.fonts.find(
          f => f.moduleName === moduleName && f.name === name
        );
        if (font) {
          ret[key] = font;
        } else {
          ret[key] = new headless.HeadlessFont(moduleName, name);
          this.fonts.push(ret[key]);
        }
      } else if (val._) {
        ret[key] = this.decodeActionData(val._);
      }
    }

    return ret;
  }

  forwardAction(name: string, data: IPC.ActionData): void {
    const action = (actions as any)[name] as Action<any, any>;
    action.forward(this.decodeActionData(data));
  }

  backwardAction(name: string, data: IPC.ActionData): void {
    const action = (actions as any)[name] as Action<any, any>;
    action.backward(this.decodeActionData(data));
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
