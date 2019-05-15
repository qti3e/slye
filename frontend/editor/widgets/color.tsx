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
import * as THREE from "three";
import { SketchPicker, ColorResult } from "react-color";

import Popper from "@material-ui/core/Popper";
import Button from "@material-ui/core/Button";
import Fade from "@material-ui/core/Fade";

export interface ColorWidgetProps {
  value: number;
  onChange(color: number): void;
}

export interface ColorWidgetState {
  open: boolean;
  anchorEl: any;
}

export class ColorWidget extends Component<ColorWidgetProps, ColorWidgetState> {
  state: ColorWidgetState = {
    open: false,
    anchorEl: null
  };

  onClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    const { currentTarget } = event;
    this.setState(state => ({
      anchorEl: currentTarget,
      open: !state.open
    }));
  };

  onChange = (color: ColorResult): void => {
    const hex = new THREE.Color(color.hex).getHex();
    this.props.onChange(hex);
  };

  render() {
    const { open, anchorEl } = this.state;
    const { value } = this.props;
    const color = new THREE.Color(value).getStyle();

    return (
      <div>
        <div
          style={{ ...styles.button, background: color }}
          onClick={this.onClick}
        />
        <Popper open={open} anchorEl={anchorEl} transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <SketchPicker
                disableAlpha={true}
                color={color}
                onChangeComplete={this.onChange}
              />
            </Fade>
          )}
        </Popper>
      </div>
    );
  }
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    width: 25,
    height: 25,
    border: "1px solid #373737",
    cursor: "pointer"
  }
};
