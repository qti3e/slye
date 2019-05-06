/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import React from "react";
import * as slye from "@slye/core";
import * as UI from "../core/ui";

import InputBase from "@material-ui/core/InputBase";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

/**
 * Slye UI Elements bindings for React.
 */
export const ui: UI.Binding<React.ReactElement> = {
  [UI.TEXT](value: string, onUpdate: UI.OnUpdate<string>) {
    const handleChange = (event: any): void => {
      onUpdate(event.target.value);
    };
    return (
      <InputBase placeholder="Text..." value={value} onChange={handleChange} />
    );
  },

  [UI.SIZE](value: number, onUpdate: UI.OnUpdate<number>) {
    const handleChange = (event: any): void => {
      onUpdate(Number(event.target.value));
    };
    return (
      <InputBase
        type="number"
        style={{ width: 35 }}
        placeholder="Size..."
        value={value}
        onChange={handleChange}
      />
    );
  },

  [UI.FONT](font: slye.Font, onUpdate: UI.OnUpdate<slye.Font>) {
    const fonts = slye.getFonts();
    const value = fonts.indexOf(font);

    const handleChange = (event: any): void => {
      onUpdate(fonts[event.target.value]);
    };

    return (
      <Select style={{ minWidth: 160 }} value={value} onChange={handleChange}>
        {fonts.map((font, id) => (
          <MenuItem value={id}>{font.name}</MenuItem>
        ))}
      </Select>
    );
  }
};
