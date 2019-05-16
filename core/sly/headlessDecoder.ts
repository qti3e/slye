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
          props[key] = new File(presentation.uuid, jvalue.uuid);
        } else if (jvalue.kind === RefKind.FONT) {
          props[key] = new HeadlessFont(jvalue.moduleName, jvalue.font);
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
