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

import InputBase from "@material-ui/core/InputBase";

export interface SizeWidgetProps {
  value: string;
  onChange(num: number): void;
}

export class SizeWidget extends Component<SizeWidgetProps> {
  handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onChange(Number(event.target.value));
  };

  render() {
    return (
      <InputBase
        style={{ width: "100%" }}
        type="number"
        placeholder="Size..."
        value={this.props.value}
        onChange={this.handleChange}
      />
    );
  }
}
