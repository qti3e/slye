/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { webFrame, remote } from "electron";
import { Client } from "./client";

webFrame.registerURLSchemeAsPrivileged("slye");

window.remote = remote;
window.client = new Client();
