/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { HeadlessStep, HeadlessComponent, HeadlessFont } from "../../headless";
import { Unserializers } from "./types";
import { unserialize } from "./index";

export const unserializers: Unserializers = {
  font: {
    async unserialize(data) {
      const key = `${data.moduleName}-${data.name}`;
      if (this.fonts.has(key)) {
        return this.fonts.get(key);
      }
      const font = new HeadlessFont(data.moduleName, data.name);
      this.fonts.set(key, font);
      return font;
    }
  },
  step: {
    async unserialize(serialized) {
      const { uuid, data } = serialized;
      if (this.steps.has(uuid)) {
        return this.steps.get(uuid);
      }
      const { position, rotation, scale } = data;
      const step = new HeadlessStep(uuid);
      step.setPosition(position[0], position[1], position[2]);
      step.setRotation(rotation[0], rotation[1], rotation[2]);
      step.setScale(scale[0], scale[1], scale[2]);
      const components = data.components.map(async c => {
        const component = await unserialize(this, c);
        step.add(component as HeadlessComponent);
      });
      await Promise.all(components);
      this.steps.set(uuid, step);
      return step;
    }
  },
  component: {
    async unserialize(serialized) {
      const { uuid, data } = serialized;
      if (this.components.has(uuid)) {
        return this.components.get(uuid);
      }
      const { position, rotation, scale, moduleName, componentName } = data;
      const props = await unserialize(this, data.props);
      const com = new HeadlessComponent(uuid, moduleName, componentName, props);
      com.setPosition(position[0], position[1], position[2]);
      com.setRotation(rotation[0], rotation[1], rotation[2]);
      com.setScale(scale[0], scale[1], scale[2]);
      this.components.set(uuid, com);
      return com;
    }
  }
};
