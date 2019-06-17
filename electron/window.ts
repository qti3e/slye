/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { BrowserWindow } from "electron";
import { Server } from "./server";
import * as path from "path";

export class Window {
  private readonly window: BrowserWindow;
  private readonly server: Server;
  closed: () => void;

  constructor(private readonly baseUrl: string) {
    // Create the browser window.
    this.window = new BrowserWindow({
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
    this.window.setMenu(null);

    // Set contexts.
    this.didFinishLoadHandler = this.didFinishLoadHandler.bind(this);
    this.closedHandler = this.closedHandler.bind(this);

    // Browser window events.
    this.window.webContents.on("did-finish-load", this.didFinishLoadHandler);
    this.window.on("closed", this.closedHandler);

    this.server = new Server(this.window);
  }

  private didFinishLoadHandler() {
    this.window.setTitle("Slye");
    this.window.show();
    this.window.focus();
  }

  private closedHandler() {
    if (this.closed) this.closed();
  }

  open() {
    this.window.loadURL(this.baseUrl);
  }

  async openFile(file: string) {
    try {
      const pd = await this.server.openFile(file);
      this.window.loadURL(`${this.baseUrl}?pd=${pd}`);
    } catch (e) {
      console.log(e);
      this.window.close();
    }
  }

  openDevTools() {
    this.window.webContents.openDevTools();
  }
}
