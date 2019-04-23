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

const remote: Remote = window.remote;

function bind(): void {
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
}

document.addEventListener("readystatechange", () => {
  if (document.readyState === "complete") {
    bind();
  }
});
