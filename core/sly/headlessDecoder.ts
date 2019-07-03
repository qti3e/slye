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
  HeadlessPresentation,
  HeadlessFont,
  HeadlessComponent,
  HeadlessStep
} from "../headless";
import { RefKind, JSONPresentation, DecoderOptions } from "./types";
import { File } from "../file";
import { PropValue } from "../interfaces";

export function headlessDecode(
  presentation: HeadlessPresentation,
  o: JSONPresentation,
  options: DecoderOptions<HeadlessStep, HeadlessComponent> = {}
): void {
  const filesMap: Map<string, File> = new Map();
  const fontsMap: Map<File, HeadlessFont[]> = new Map();

  function getFile(uuid: string, moduleName: string): File {
    const key = `${uuid}-${moduleName}`;
    if (filesMap.has(key)) return filesMap.get(key);
    const isModuleAsset = !!moduleName;
    const owner = isModuleAsset ? moduleName : presentation.uuid;
    const file = new File(owner, uuid, isModuleAsset);
    filesMap.set(key, file);
    return file;
  }

  function getFont(name: string, file: File): HeadlessFont {
    if (!fontsMap.has(file)) fontsMap.set(file, []);
    const fonts = fontsMap.get(file);
    for (const font of fonts) {
      if (font.name === name) {
        return font;
      }
    }
    const font = new HeadlessFont(name, file);
    fontsMap.set(file, [...fonts, font]);
    return font;
  }

  for (let uuid in o.steps) {
    const jstep = o.steps[uuid];

    const step = new HeadlessStep(uuid);
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
          props[key] = getFile(jvalue.uuid, jvalue.moduleId);
        } else if (jvalue.kind === RefKind.FONT) {
          const file = getFile(jvalue.fileUUID, jvalue.moduleId);
          props[key] = getFont(jvalue.font, file);
        }
      }

      const com = new HeadlessComponent(
        jcom.uuid,
        jcom.moduleName,
        jcom.component,
        props
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
