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
import { RTLify } from "persian-utils";

import InputBase from "@material-ui/core/InputBase";

export interface TextWidgetProps {
  value: string;
  onChange(text: string): void;
}

export class TextWidget extends Component<TextWidgetProps> {
  handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onChange(event.target.value);
  };

  render() {
    return (
      <InputBase
        style={{ width: "100%" }}
        inputRef={RTLify}
        placeholder="Text..."
        value={this.props.value}
        onChange={this.handleChange}
      />
    );
  }
}
