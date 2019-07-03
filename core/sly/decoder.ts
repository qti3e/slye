/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { PropValue } from "../interfaces";
import { ThreePresentation, ThreeStep, ThreeComponent, Font } from "../three";
import { getFont as getRegFont } from "../fonts";
import { File } from "../file";
import { file, component } from "../module";
import { RefKind, JSONPresentation, DecoderOptions } from "./types";

/**
 * Read a Slye presentation from a raw-object.
 *
 * @param {ThreePresentation} presentation An empty presentation instance.
 * @param {JSONPresentation} o
 * @returns {Promise<void>}
 */
export async function sly(
  presentation: ThreePresentation,
  o: JSONPresentation,
  options: DecoderOptions<ThreeStep, ThreeComponent> = {}
): Promise<void> {
  const filesMap: Map<string, File> = new Map();
  const fontsMap: Map<File, Font[]> = new Map();

  function getFile(uuid: string, moduleName: string): Promise<File> {
    const isModuleAsset = !!moduleName;
    if (isModuleAsset) return file(moduleName, uuid) as Promise<File>;
    if (filesMap.has(uuid)) return Promise.resolve(filesMap.get(uuid));
    const newFile = new File(presentation.uuid, uuid, isModuleAsset);
    filesMap.set(uuid, newFile);
    return Promise.resolve(newFile);
  }

  function getFont(name: string, file: File): Font {
    const regFont = getRegFont(name);
    if (regFont && regFont.file === file) {
      return regFont as Font;
    }
    if (!fontsMap.has(file)) fontsMap.set(file, []);
    const fonts = fontsMap.get(file);
    for (const font of fonts) {
      if (font.name === name) {
        return font;
      }
    }
    const font = new Font(name, file);
    fontsMap.set(file, [...fonts, font]);
    return font;
  }

  if (o.template) {
    //const tem = await component(o.template.moduleName, o.template.component);
    //presentation.setTemplate(tem);
  }

  for (let uuid in o.steps) {
    const jstep = o.steps[uuid];

    const step = new ThreeStep(uuid);
    step.setPosition(jstep.position[0], jstep.position[1], jstep.position[2]);
    step.setRotation(jstep.rotation[0], jstep.rotation[1], jstep.rotation[2]);
    step.setScale(jstep.scale[0], jstep.scale[1], jstep.scale[2]);

    for (let j = 0; j < jstep.components.length; ++j) {
      const jcom = jstep.components[j];
      const props: Record<string, PropValue> = {};

      for (const key in jcom.props) {
        const jvalue = jcom.props[key];
        if (typeof jvalue === "number" || typeof jvalue === "string") {
          props[key] = jvalue;
        } else if (jvalue.kind === RefKind.FILE) {
          props[key] = await getFile(jvalue.uuid, jvalue.moduleId);
        } else if (jvalue.kind === RefKind.FONT) {
          const file = await getFile(jvalue.fileUUID, jvalue.moduleId);
          props[key] = getFont(jvalue.font, file);
        }
      }

      const com = await component(
        jcom.moduleName,
        jcom.component,
        props,
        jcom.uuid
      );
      com.setPosition(jcom.position[0], jcom.position[1], jcom.position[2]);
      com.setRotation(jcom.rotation[0], jcom.rotation[1], jcom.rotation[2]);
      com.setScale(jcom.scale[0], jcom.scale[1], jcom.scale[2]);

      step.add(com);
      if (options.onComponent) options.onComponent(com);
    }

    presentation.add(step);
    if (options.onStep) options.onStep(step);
  }
}
