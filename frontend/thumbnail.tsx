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

export interface ThumbnailsProps {
  presentation: slye.Presentation;
  selected: slye.Step;
  onSelect: (step: slye.Step) => void;
}

export class Thumbnails extends Component<ThumbnailsProps> {
  render() {
    return null;
  }
}
