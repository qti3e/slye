/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { PresentationBase } from "../base";
import {
  JSONPresentation,
  JSONPresentationStep,
  JSONPresentationComponent
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

      // TODO(qti3e) Props

      jstep.components.push(jcomp);
    }

    ret.steps[step.uuid] = jstep;
  }

  return ret;
}
