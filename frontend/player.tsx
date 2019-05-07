/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import React, { Component } from "react";
import Screenfull from "screenfull";
import * as slye from "@slye/core";

export interface PlayerProps {
  presentation: slye.Presentation;
}

export class Player extends Component<PlayerProps> {
  componentWillReceiveProps(nextProps: PlayerProps) {
    if (nextProps.presentation !== this.props.presentation)
      throw new Error("Player: `presentation` can not be changed.");
  }

  componentWillMount() {
    document.addEventListener("keydown", this.onKeydown);
    document.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("touchstart", this.onTouchStart);
    if (Screenfull) Screenfull.request(this.props.presentation.domElement);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeydown);
    document.removeEventListener("keyup", this.onKeyUp);
    document.removeEventListener("touchstart", this.onTouchStart);
    if (Screenfull) Screenfull.exit();
  }

  // Events.
  onKeydown = (event: KeyboardEvent): void => {
    if (
      event.keyCode === 9 ||
      (event.keyCode >= 32 && event.keyCode <= 34) ||
      (event.keyCode >= 37 && event.keyCode <= 40)
    ) {
      event.preventDefault();
    }
  };

  onKeyUp = (event: KeyboardEvent): void => {
    switch (event.keyCode) {
      case 33: // pg up
      case 37: // left
      case 38: // up
        this.props.presentation.prev();
        event.preventDefault();
        break;
      case 9: // tab
      case 32: // space
      case 34: // pg down
      case 39: // right
      case 40: // down
        this.props.presentation.next();
        event.preventDefault();
        break;
    }
  };

  onTouchStart = (event: TouchEvent): void => {
    if (event.touches.length === 1) {
      const x = event.touches[0].clientX;
      const width = innerWidth * 0.3;
      if (x < width) {
        this.props.presentation.prev();
      } else if (x > innerWidth - width) {
        this.props.presentation.next();
      }
    }
  };

  handleContainerRef = (element: HTMLDivElement): void => {
    const { domElement } = this.props.presentation;
    element.appendChild(domElement);
  };

  render(): null {
    return null;
  }
}
