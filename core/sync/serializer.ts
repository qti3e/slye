/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import {
  FontBase,
  StepBase,
  ComponentBase,
  ComponentProps
} from "../interfaces";
import {
  ActionData,
  Words,
  SerializedActionData,
  SerializedStep,
  SerializedComponent,
  SerializedFile
} from "./common";
import { File } from "../file";
import { ActionTypes } from "../actions";

interface UnserializeResuly {
  forward: boolean;
  action: keyof ActionTypes;
  data: any;
}

interface Class<T> {
  new (...data: any[]): T;
}

export abstract class Serializer {
  readonly components: Map<string, ComponentBase> = new Map();
  readonly steps: Map<string, StepBase> = new Map();
  readonly files: Map<string, File> = new Map();
  presentationUUID: string;

  constructor() {
    this.unserializeComponent = this.unserializeComponent.bind(this);
  }

  private serializeComponent(val: ComponentBase): SerializedComponent {
    if (this.components.has(val.uuid))
      return {
        [Words.COMPONENT]: val.uuid
      };
    this.components.set(val.uuid, val);
    const { x: px, y: py, z: pz } = val.getPosition();
    const { x: rx, y: ry, z: rz } = val.getRotation();
    const { x: sx, y: sy, z: sz } = val.getScale();
    return {
      [Words.COMPONENT]: val.uuid,
      [Words.DATA]: {
        [Words.MODULE_NAME]: val.moduleName,
        [Words.COMPONENT_NAME]: val.componentName,
        [Words.PROPS]: this.serializeActionData(val.props),
        [Words.POSITION]: [px, py, pz],
        [Words.ROTATION]: [rx, ry, rz],
        [Words.SCALE]: [sx, sy, sz]
      }
    };
  }

  private serializeStep(val: StepBase): SerializedStep {
    if (this.steps.has(val.uuid))
      return {
        [Words.STEP]: val.uuid
      };
    this.steps.set(val.uuid, val);
    const { x: px, y: py, z: pz } = val.getPosition();
    const { x: rx, y: ry, z: rz } = val.getRotation();
    const { x: sx, y: sy, z: sz } = val.getScale();
    return {
      [Words.STEP]: val.uuid,
      [Words.DATA]: {
        [Words.COMPONENTS]: val.components.map(c => this.serializeComponent(c)),
        [Words.POSITION]: [px, py, pz],
        [Words.ROTATION]: [rx, ry, rz],
        [Words.SCALE]: [sx, sy, sz]
      }
    };
  }

  private serializeActionData(data: any): ActionData {
    const ret: ActionData = {};

    for (const key in data) {
      const val = (data as any)[key];
      if (
        val === undefined ||
        val === null ||
        typeof val === "string" ||
        typeof val === "number" ||
        typeof val === "boolean"
      ) {
        ret[key] = val;
      } else if (val.isSlyeComponent) {
        ret[key] = this.serializeComponent(val);
      } else if (val.isSlyeStep) {
        ret[key] = this.serializeStep(val);
      } else if (val.isSlyeFont) {
        ret[key] = {
          [Words.FONT]: {
            [Words.MODULE_NAME]: val.moduleName,
            [Words.NAME]: val.name
          }
        };
      } else if (val.isSlyeFile) {
        ret[key] = {
          [Words.FILE]: val.uuid
        };
      } else {
        ret[key] = {
          _: this.serializeActionData(val)
        };
      }
    }

    return ret;
  }

  private async unserializeComponent(
    c: SerializedComponent
  ): Promise<ComponentBase> {
    const { [Words.DATA]: data, [Words.COMPONENT]: uuid } = c;
    if (!data) return this.components.get(uuid);

    const component = await this.provideComponent(
      uuid,
      data[Words.MODULE_NAME],
      data[Words.COMPONENT_NAME],
      await this.unserializeActionData(data[Words.PROPS])
    );
    component.setPosition(...data[Words.POSITION]);
    component.setRotation(...data[Words.ROTATION]);
    component.setScale(...data[Words.SCALE]);
    this.components.set(uuid, component);

    return component;
  }

  private unserializeFile(c: SerializedFile): File {
    const { [Words.FILE]: uuid } = c;
    if (this.files.has(uuid)) return this.files.get(uuid);
    // TODO(qti3e);
    const file = new File(this.presentationUUID, uuid);
    this.files.set(uuid, file);
    return file;
  }

  private unserializeStep(c: SerializedStep): StepBase {
    const { [Words.DATA]: data, [Words.STEP]: uuid } = c;
    if (!data) return this.steps.get(uuid);

    const step = this.provideStep(uuid);
    step.setPosition(...data[Words.POSITION]);
    step.setRotation(...data[Words.ROTATION]);
    step.setScale(...data[Words.SCALE]);
    data[Words.COMPONENTS]
      .map(this.unserializeComponent)
      .map(async c => step.add(await c));
    this.steps.set(uuid, step);

    return step;
  }

  private async unserializeActionData(data: ActionData): Promise<any> {
    const ret: Record<string, any> = {};

    for (const key in data) {
      const val = data[key] as any;

      if (
        val === undefined ||
        val === null ||
        typeof val === "string" ||
        typeof val === "number" ||
        typeof val === "boolean"
      ) {
        ret[key] = val;
      } else if (val[Words.COMPONENT]) {
        ret[key] = await this.unserializeComponent(val);
      } else if (val[Words.STEP]) {
        ret[key] = this.unserializeStep(val);
      } else if (val[Words.FILE]) {
        ret[key] = this.unserializeFile(val);
      } else if (val[Words.FONT]) {
        const data = val[Words.FONT];
        ret[key] = await this.provideFont(
          data[Words.MODULE_NAME],
          data[Words.NAME]
        );
      } else if (val._) {
        ret[key] = await this.unserializeActionData(val._);
      }
    }

    return ret;
  }

  serialize(forward: boolean, action: keyof ActionTypes, data: any): string {
    return JSON.stringify({
      [forward ? Words.FORWARD : Words.BACKWARD]: true,
      [Words.ACTION]: action,
      [Words.DATA]: this.serializeActionData(data)
    });
  }

  async unserialize(text: string): Promise<UnserializeResuly> {
    const raw = JSON.parse(text);
    const data = await this.unserializeActionData(raw[Words.DATA]);
    return {
      forward: !!raw[Words.FORWARD],
      action: raw[Words.ACTION],
      data: data
    };
  }

  abstract provideFont(moduleName: string, fontName: string): Promise<FontBase>;
  abstract provideStep(uuid: string): StepBase;
  abstract provideComponent(
    uuid: string,
    moduleName: string,
    componentName: string,
    props: ComponentProps
  ): Promise<ComponentBase>;
}