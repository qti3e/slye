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
  StepBase,
  ComponentBase,
  FontBase,
  ComponentProps
} from "../interfaces";
import { component, font } from "../module";
import { ThreeStep } from "../three";
import { Serializer } from "./serializer";

export class ThreeSerializer extends Serializer {
  provideFont(moduleName: string, fontName: string): Promise<FontBase> {
    return font(moduleName, fontName);
  }

  provideStep(uuid: string): StepBase {
    return new ThreeStep(uuid);
  }

  provideComponent(
    uuid: string,
    moduleName: string,
    componentName: string,
    props: ComponentProps
  ): Promise<ComponentBase> {
    return component(moduleName, componentName, props, uuid);
  }
}
