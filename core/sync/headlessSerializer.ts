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
import { Serializer } from "./serializer";
import { HeadlessFont, HeadlessStep, HeadlessComponent } from "../headless";

export class HeadlessSerializer extends Serializer {
  private fonts: FontBase[] = [];

  async provideFont(moduleName: string, fontName: string): Promise<FontBase> {
    let font = this.fonts.filter(
      f => f.moduleName === moduleName && f.name === fontName
    )[0];
    if (font) return font;
    font = new HeadlessFont(moduleName, fontName);
    this.fonts.push(font);
    return font;
  }

  async provideComponent(
    uuid: string,
    moduleName: string,
    componentName: string,
    props: ComponentProps
  ): Promise<ComponentBase> {
    return new HeadlessComponent(uuid, moduleName, componentName, props);
  }

  provideStep(uuid: string): StepBase {
    return new HeadlessStep(uuid);
  }
}
