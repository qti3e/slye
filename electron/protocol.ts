/*
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { protocol } from "electron";
import { Server } from "./server";
import * as path from "path";

export function registerSlyeProtocol(server: Server): void {
  protocol.registerFileProtocol(
    "slye",
    (request, callback) => {
      const url = request.url.substr(7);
      const [cmd, ...internalUrlParts] = url.split("/");
      const internalUrl = internalUrlParts.join("/");

      console.log(cmd);

      callback(path.normalize(path.join(__dirname, "modules", internalUrl)));
    },
    error => {
      if (error) console.error("Failed to register protocol");
    }
  );
}
