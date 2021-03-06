/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { ThreeStep, ThreeComponent, Font } from "../../three";
import { File } from "../../file";
import { file, component } from "../../module";
import { getFont } from "../../fonts";
import { Unserializers } from "./types";
import { unserialize } from "./index";

export const unserializers: Unserializers = {
  font: {
    async unserialize(data) {
      const file = await unserialize(this, data.file);
      const regFont = getFont(data.name);
      if (regFont && regFont.file === file) {
        return regFont;
      }
      const key = `${file.owner}-${data.name}`;
      if (this.fonts.has(key)) {
        return this.fonts.get(key);
      }
      const font = new Font(data.name, file as any);
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
      const step = new ThreeStep(uuid);
      step.setPosition(position[0], position[1], position[2]);
      step.setRotation(rotation[0], rotation[1], rotation[2]);
      step.setScale(scale[0], scale[1], scale[2]);
      const components = data.components.map(async c => {
        const component = await unserialize(this, c);
        step.add(component as ThreeComponent);
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
      const { position, rotation, scale } = data;
      const props = await unserialize(this, data.props);
      const com = await component(
        data.moduleName,
        data.componentName,
        props,
        uuid
      );
      com.setPosition(position[0], position[1], position[2]);
      com.setRotation(rotation[0], rotation[1], rotation[2]);
      com.setScale(scale[0], scale[1], scale[2]);
      this.components.set(uuid, com);
      return com;
    }
  },
  file: {
    async unserialize(serialized) {
      const { uuid, moduleName } = serialized;
      const isModuleAsset = !!moduleName;
      if (isModuleAsset) {
        return await file(moduleName, uuid);
      }
      const owner = isModuleAsset ? moduleName : this.presentationUUID;
      const key = `${isModuleAsset ? owner : ""}-${uuid}`;
      if (this.files.has(key)) {
        return this.files.get(key);
      }
      const newFile = new File(owner, uuid, isModuleAsset);
      this.files.set(key, newFile);
      return newFile;
    }
  }
};
