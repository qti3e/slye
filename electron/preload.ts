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
window.client = new Client();

// When a preload script is loaded, the DOM is not present yet, so `document`
// is undefined.
setTimeout(() => {
  document.addEventListener("readystatechange", () => {
    if (document.readyState !== "complete") return;

    document.getElementById("min-btn").addEventListener("click", () => {
      const window = remote.getCurrentWindow();
      window.minimize();
    });

    document.getElementById("max-btn").addEventListener("click", () => {
      const window = remote.getCurrentWindow();
      if (!window.isMaximized()) {
        window.maximize();
      } else {
        window.unmaximize();
      }
    });

    document.getElementById("close-btn").addEventListener("click", () => {
      const window = remote.getCurrentWindow();
      window.close();
    });
  });
});
