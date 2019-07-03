/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { PresentationBase, FontBase, FileBase } from "../interfaces";
import {
  JSONPresentation,
  JSONPresentationStep,
  JSONPresentationComponent,
  RefKind
} from "./types";

export function encode(presentation: PresentationBase): JSONPresentation {
  const ret: JSONPresentation = {
    template: undefined, // TODO(qti3e)
    steps: {}
  };

  for (const step of presentation.steps) {
    const { x: px, y: py, z: pz } = step.getPosition();
    const { x: rx, y: ry, z: rz } = step.getRotation();
    const { x: sx, y: sy, z: sz } = step.getScale();

    const jstep: JSONPresentationStep = {
      position: [px, py, pz],
      rotation: [rx, ry, rz],
      scale: [sx, sy, sz],
      components: []
    };

    for (const component of step.components) {
      const { x: px, y: py, z: pz } = component.getPosition();
      const { x: rx, y: ry, z: rz } = component.getRotation();
      const { x: sx, y: sy, z: sz } = component.getScale();

      const jcomp: JSONPresentationComponent = {
        uuid: component.uuid,
        moduleName: component.moduleName,
        component: component.componentName,
        position: [px, py, pz],
        rotation: [rx, ry, rz],
        scale: [sx, sy, sz],
        props: {}
      };

      for (const key in component.props) {
        const value = component.props[key];
        if (typeof value === "string" || typeof value === "number") {
          jcomp.props[key] = value;
        } else if (isFont(value)) {
          jcomp.props[key] = {
            kind: RefKind.FONT,
            font: value.name,
            moduleName: value.moduleName
          };
        } else if (isFile(value)) {
          jcomp.props[key] = {
            kind: RefKind.FILE,
            uuid: value.uuid,
            moduleId: value.isModuleAsset ? value.owner : undefined
          };
        } else {
          throw new Error(`Encoder for ${value} is not implemented yet.`);
        }
      }

      jstep.components.push(jcomp);
    }

    ret.steps[step.uuid] = jstep;
  }

  return ret;
}

function isFont(value: any): value is FontBase {
  if (typeof value !== "object") return false;
  return !!value.isSlyeFont;
}

function isFile(value: any): value is FileBase {
  if (typeof value !== "object") return false;
  return !!value.isSlyeFile;
}
