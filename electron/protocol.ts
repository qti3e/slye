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
import { presentations } from "./presentation";
import { join, normalize } from "path";

export function registerSlyeProtocol(): void {
  protocol.registerFileProtocol(
    "slye",
    (request, callback) => {
      const url = request.url.substr(7);
      const [cmd, ...internalUrlParts] = url.split("/");
      const internalUrl = internalUrlParts.join("/");

      switch (cmd) {
        case "modules":
          callback(normalize(join(__dirname, "modules", internalUrl)));
          break;
        case "presentation-assets":
          const [pd, asset] = internalUrlParts;
          callback(getAssetURL(pd, asset));
          break;
        default:
        // TODO(qti3e) Handle 404.
      }
    },
    error => {
      if (error) console.error("Failed to register protocol");
    }
  );
}

function getAssetURL(pd: string, asset: string): string {
  const p = presentations.get(pd);
  return normalize(join(p.dir, "assets", asset));
}
