/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Remote } from "electron";
import { Client } from "./ipc";
import * as Slye from "../core";
import * as Three from "three";

declare global {
  interface Window {
    remote: Remote;
    client: Client;
    slye: typeof Slye;
    THREE: typeof Three;
    slyeModulesTable: Map<string, Slye.ModuleInterface>;
  }
  const client: Client;
}
