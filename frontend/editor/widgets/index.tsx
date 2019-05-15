/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import * as UI from "../../../core/ui";

import { TextWidget } from "./text";
import { SizeWidget } from "./size";
import { FontWidget } from "./font";
import { ColorWidget } from "./color";

export const Widgets = {
  [UI.TEXT]: TextWidget,
  [UI.SIZE]: SizeWidget,
  [UI.FONT]: FontWidget,
  [UI.COLOR]: ColorWidget
};
