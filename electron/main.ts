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
import { Server } from "./server";
import { registerSlyeProtocol } from "./protocol";
import * as path from "path";

let mainWindow: Electron.BrowserWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    frame: false,
    icon: __dirname + "/icons/favicon.png",
    title: "Slye",
    webPreferences: {
      // We don't want Node in the renderer thread.
      // Every file access should be done in the main thread.
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });

  // Disable default menu bar.
  mainWindow.setMenu(null);

  mainWindow.webContents.on("did-finish-load", () => {
    if (!mainWindow) throw new Error('"mainWindow" is not defined');
    mainWindow.setTitle("Slye");
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const server = new Server(mainWindow);
  registerSlyeProtocol(server);

  if (process.env.SLYE_DEV) {
    mainWindow.loadURL(`http://localhost:1234`);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`file://${__dirname}/index.html`);
  }
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
