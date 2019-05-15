/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Renderer } from "./renderer";

export interface StepBarButton {
  label: string;
  icon: string; // For now just material icons.
  clickHandler: (renderer: Renderer) => any;
}

const e = eval;
const g = e("this");
const stepBarButtons: StepBarButton[] = g.slyeSBtns || (g.slyeSBtns = []);

export function addStepbarButton(
  label: string,
  icon: string,
  clickHandler: (renderer: Renderer) => any
): void {
  stepBarButtons.push(
    Object.freeze({
      label,
      icon,
      clickHandler
    })
  );
}

export function getStepbarButtons(): StepBarButton[] {
  return [...stepBarButtons];
}
