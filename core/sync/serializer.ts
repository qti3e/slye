/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { StepBase, ComponentBase } from "../interfaces";
import {
  ActionData,
  Words,
  SerializedActionData,
  SerializedStep,
  SerializedComponent
} from "./common";

interface UnserializeResuly {
  forward: boolean;
  action: string;
  data: any;
}

interface Class<T> {
  new (...data: any[]): T;
}

export class Serializer {
  readonly components: Map<string, ComponentBase> = new Map();
  readonly steps: Map<string, StepBase> = new Map();

  constructor(
    private stepImplementation: Class<StepBase>,
    private componentImplementation: Class<ComponentBase>
  ) {
    this.unserializeComponent = this.unserializeComponent.bind(this);
  }

  private serializeComponent(val: ComponentBase): SerializedComponent {
    if (this.components.has(val.uuid))
      return {
        [Words.COMPONENT]: val.uuid
      };
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
    this.components.set(val.uuid, val);
  }

  private serializeStep(val: StepBase): SerializedStep {
    if (this.steps.has(val.uuid))
      return {
        [Words.STEP]: val.uuid
      };
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
    this.steps.set(val.uuid, val);
  }

  private serializeActionData(data: any): ActionData {
    const ret: ActionData = {};

    for (const key in data) {
      const val = (data as any)[key];
      if (
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
      } else {
        ret[key] = {
          _: this.serializeActionData(val)
        };
      }
    }

    return ret;
  }

  private unserializeComponent(c: SerializedComponent): ComponentBase {
    const { [Words.DATA]: data, [Words.COMPONENT]: uuid } = c;
    if (!data) return this.components.get(uuid);

    const component = new this.componentImplementation(
      uuid,
      data[Words.MODULE_NAME],
      data[Words.COMPONENT_NAME],
      this.unserializeActionData(data[Words.PROPS])
    );
    component.setPosition(...data[Words.POSITION]);
    component.setRotation(...data[Words.ROTATION]);
    component.setScale(...data[Words.SCALE]);
    this.components.set(uuid, component);

    return component;
  }

  private unserializeStep(c: SerializedStep): StepBase {
    const { [Words.DATA]: data, [Words.STEP]: uuid } = c;
    if (!data) return this.steps.get(uuid);

    const step = new this.stepImplementation(uuid);
    step.setPosition(...data[Words.POSITION]);
    step.setRotation(...data[Words.ROTATION]);
    step.setScale(...data[Words.SCALE]);
    data[Words.COMPONENTS].map(this.unserializeComponent).map(c => step.add(c));
    this.steps.set(uuid, step);

    return step;
  }

  private unserializeActionData(data: ActionData): any {
    const ret: Record<string, any> = {};

    for (const key in data) {
      const val = data[key] as any;

      if (
        typeof val === "string" ||
        typeof val === "number" ||
        typeof val === "boolean"
      ) {
        ret[key] = val;
      } else if (val[Words.COMPONENT]) {
        ret[key] = this.unserializeComponent(val);
      } else if (val[Words.STEP]) {
        ret[key] = this.unserializeStep(val);
      } else if (val[Words.FONT]) {
        // TODO(qti3e)
        //const { moduleName, name } = val.font;
        //const font = this.fonts.find(
        //f => f.moduleName === moduleName && f.name === name
        //);
        //if (font) {
        //ret[key] = font;
        //} else {
        //ret[key] = new headless.HeadlessFont(moduleName, name);
        //this.fonts.push(ret[key]);
        //}
      } else if (val._) {
        ret[key] = this.unserializeActionData(val._);
      }
    }

    return ret;
  }

  serialize(forward: boolean, action: string, data: any): string {
    return JSON.stringify({
      [forward ? Words.FORWARD : Words.BACKWARD]: true,
      [Words.ACTION]: action,
      [Words.DATA]: this.serializeActionData(data)
    });
  }

  unserialize(text: string): UnserializeResuly {
    const raw = JSON.parse(text);
    return {
      forward: !!raw[Words.FORWARD],
      action: raw[Words.ACTION],
      data: this.unserializeActionData(raw.data)
    };
  }
}
