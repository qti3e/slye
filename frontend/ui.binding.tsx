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
import * as UI from "@slye/core/ui";

/**
 * Slye UI Elements bindings for React.
 */
export const ui: UI.Binding<React.ReactElement> = {
  [UI.TEXT](value: string, onUpdate: UI.OnUpdate<string>) {
    return (
      <div>
        <input value={value} />
      </div>
    );
  },

  [UI.SIZE](value: number, onUpdate: UI.OnUpdate<number>) {
    return null;
  },

  [UI.FONT](value: slye.Font, onUpdate: UI.OnUpdate<slye.Font>) {
    return null;
  }
};
