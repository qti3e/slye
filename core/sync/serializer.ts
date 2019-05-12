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

export class Serializer {
  private readonly components: Map<string, ComponentBase> = new Map();
  private readonly steps: Map<string, StepBase> = new Map();

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

  serialize(forward: boolean, action: string, data: any): string {
    return "";
  }
}
