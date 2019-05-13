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
  renderer: slye.Renderer;
  onExit: () => void;
}

export class Player extends Component<PlayerProps> {
  componentWillReceiveProps(nextProps: PlayerProps) {
    if (nextProps.renderer !== this.props.renderer)
      throw new Error("Player: `renderer` can not be changed.");
  }

  componentWillMount() {
    this.props.renderer.setState("player");
    document.addEventListener("keydown", this.onKeydown);
    document.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("touchstart", this.onTouchStart);
    if (Screenfull) {
      Screenfull.request(this.props.renderer.domElement);
      Screenfull.on("change", this.handleScreenfull);
      this.props.renderer.resize(innerWidth, innerHeight);
    }
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
      case 33: // Pg up
      case 37: // Left
      case 38: // Up
        this.props.renderer.prev();
        event.preventDefault();
        break;
      case 9: // Tab
      case 32: // Space
      case 34: // pg down
      case 39: // Right
      case 40: // Down
        this.props.renderer.next();
        event.preventDefault();
        break;
      case 27: // Escape
        this.props.onExit();
        event.preventDefault();
        break;
    }
  };

  onTouchStart = (event: TouchEvent): void => {
    if (event.touches.length === 1) {
      const x = event.touches[0].clientX;
      const width = innerWidth * 0.3;
      if (x < width) {
        this.props.renderer.prev();
      } else if (x > innerWidth - width) {
        this.props.renderer.next();
      }
    }
  };

  handleScreenfull = () => {
    if (Screenfull && !Screenfull.isFullscreen) {
      this.props.onExit();
      Screenfull.off("change", this.handleScreenfull);
    }
  };

  render(): null {
    return null;
  }
}
