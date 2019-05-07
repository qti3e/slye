/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import React, { Component, Fragment } from "react";
import * as slye from "@slye/core";

export interface StepEditorProps {
  presentation: slye.Presentation;
  step: slye.Step;
  back: () => void;
}

export class StepEditor extends Component<StepEditorProps> {
  render() {
    return null;
  }
}
