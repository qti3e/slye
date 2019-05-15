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
import * as slye from "@slye/core";

import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

export interface FontWidgetProps {
  value: slye.FontBase;
  onChange(font: slye.FontBase): void;
}

export class FontWidget extends Component<FontWidgetProps> {
  render() {
    const fonts = slye.getFonts();
    const value = fonts.indexOf(this.props.value);

    const handleChange = (event: any): void => {
      this.props.onChange(fonts[event.target.value]);
    };

    // TODO(qti3e) Virtual scrolling and font preview.
    return (
      <Select style={{ width: "100%" }} value={value} onChange={handleChange}>
        {fonts.map((font, id) => (
          <MenuItem value={id} key={"font-" + id}>
            {font.name}
          </MenuItem>
        ))}
      </Select>
    );
  }
}
