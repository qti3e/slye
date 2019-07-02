/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { ComponentBase, FontBase, StepBase } from "../../interfaces";
import {
  Unserializers,
  Serializers,
  Serialized,
  SerializedData,
  Primary
} from "./types";
import { serialize, unserialize } from "./index";

export const serializers: (u: Unserializers) => Serializers = u => ({
  primary: {
    test(data): data is Primary {
      return (
        typeof data === "string" ||
        typeof data === "number" ||
        typeof data === "boolean" ||
        typeof data === "undefined" ||
        data === null
      );
    },
    serialize(data) {
      return data;
    },
    async unserialize(data) {
      return data;
    }
  },
  font: {
    test(data): data is FontBase {
      return !!(data && typeof data === "object" && data.isSlyeFont);
    },
    serialize(data) {
      const key = `${data.moduleName}-${data.name}`;
      this.fonts.set(key, data);
      return {
        name: data.name,
        moduleName: data.moduleName
      };
    },
    ...u.font
  },
  step: {
    test(data): data is StepBase {
      return !!(data && typeof data === "object" && data.isSlyeStep);
    },
    serialize(step) {
      const { uuid } = step;

      let sendData = !this.steps.has(uuid);
      this.steps.set(uuid, step);

      const position = step.getPosition();
      const rotation = step.getRotation();
      const scale = step.getScale();
      const components = step.components;

      return {
        uuid,
        data: sendData
          ? {
              position: [position.x, position.y, position.z],
              rotation: [rotation.x, rotation.y, rotation.z],
              scale: [scale.x, scale.y, scale.z],
              components: components.map<Serialized<"component">>(
                c => serialize(this, c) as any
              )
            }
          : undefined
      };
    },
    ...u.step
  },
  component: {
    test(data): data is ComponentBase {
      return !!(data && typeof data === "object" && data.isSlyeComponent);
    },
    serialize(component) {
      const { uuid } = component;

      let sendData = !this.components.has(uuid);
      this.components.set(uuid, component);

      const position = component.getPosition();
      const rotation = component.getRotation();
      const scale = component.getScale();

      return {
        uuid,
        data: sendData
          ? {
              position: [position.x, position.y, position.z],
              rotation: [rotation.x, rotation.y, rotation.z],
              scale: [scale.x, scale.y, scale.z],
              moduleName: component.moduleName,
              componentName: component.componentName,
              props: serialize(this, component.props) as any
            }
          : undefined
      };
    },
    ...u.component
  },
  object: {
    test(data): data is Record<string, any> {
      return data && typeof data === "object";
    },
    serialize(obj) {
      const ret: Record<string, SerializedData> = {};
      for (const key in obj) {
        ret[key] = serialize(this, obj[key]);
      }
      return ret;
    },
    async unserialize(obj) {
      const ret: Record<string, any> = {};
      for (const key in obj) {
        ret[key] = await unserialize(this, obj[key]);
      }
      return ret;
    }
  }
});
