/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Presentation } from "./presentation";
import { component, font } from "./module";
import { Step } from "./step";
import { Component, PropValue } from "./component";

export enum RefKind {
  ASSET,
  FONT
}

export interface AssetRef {
  kind: RefKind.ASSET;
  key: string;
}

export interface FontRef {
  kind: RefKind.FONT;
  moduleName: string;
  font: string;
}

export type ComponentPropValue = AssetRef | FontRef | string | number;

export interface JSONPresentationComponent {
  moduleName: string;
  component: string;
  position: [number, number, number];
  rotation: [number, number, number];
  props: Record<string, ComponentPropValue>;
}

export interface JSONPresentationStep {
  position: [number, number, number];
  rotation: [number, number, number];
  components: JSONPresentationComponent[];
}

export interface JSONPresentation {
  template?: {
    moduleName: string;
    component: string;
  };
  steps: Record<string, JSONPresentationStep>;
}

/**
 * Read a Slye presentation from a raw-object.
 *
 * @param {Presentation} presentation An empty presentation instance.
 * @param {JSONPresentation} o
 * @returns {Promise<void>}
 */
export async function sly(
  presentation: Presentation,
  o: JSONPresentation
): Promise<void> {
  if (o.template) {
    const tem = await component(o.template.moduleName, o.template.component);
    presentation.setTemplate(tem);
  }

  for (let uuid in o.steps) {
    const jstep = o.steps[uuid];

    const step = new Step(uuid);
    step.setPosition(jstep.position[0], jstep.position[1], jstep.position[2]);
    step.setRotation(jstep.rotation[0], jstep.rotation[1], jstep.rotation[2]);

    for (let j = 0; j < jstep.components.length; ++j) {
      const jcom = jstep.components[j];
      const props: Record<string, PropValue> = {};

      for (const key in jcom.props) {
        const jvalue = jcom.props[key];
        if (typeof jvalue === "number" || typeof jvalue === "string") {
          props[key] = jvalue;
        } else if (jvalue.kind === RefKind.ASSET) {
          props[key] = await presentation.asset(jvalue.key);
        } else if (jvalue.kind === RefKind.FONT) {
          props[key] = await font(jvalue.moduleName, jvalue.font);
        }
      }

      const com = await component(jcom.moduleName, jcom.component, props);
      com.setPosition(jcom.position[0], jcom.position[1], jcom.position[2]);
      com.setRotation(jcom.rotation[0], jcom.rotation[1], jcom.rotation[2]);

      step.add(com);
    }

    presentation.add(step);
  }

  setTimeout(() => presentation.goTo(0, 0));
}
