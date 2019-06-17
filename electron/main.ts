/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { app, BrowserWindow } from "electron";
import { registerSlyeProtocol } from "./protocol";
import { Window as SlyeWindow } from "./window";
import * as path from "path";

function createWindow(file?: string): void {
  const dev = !!process.env.SLYE_DEV;
  const baseUrl = dev
    ? "http://localhost:1234"
    : `file://${__dirname}/index.html`;
  const win = new SlyeWindow(baseUrl);

  if (dev) {
    win.openDevTools();
  }

  if (file) {
    win.openFile(file);
  } else {
    win.open();
  }
}

function main() {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
    return;
  }

  app.on("second-instance", (event, commandLine, workingDirectory) => {
    let file = app.isPackaged ? commandLine[1] : commandLine[2];
    if (file) file = path.join(workingDirectory, file);
    createWindow(file);
  });

  app.on("ready", () => {
    registerSlyeProtocol();

    const file = app.isPackaged ? process.argv[1] : process.argv[2];
    createWindow(file);
  });

  // Quit when all windows are closed.
  app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    createWindow();
  });
}

main();
