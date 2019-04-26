/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import React from "react";
import ReactDOM from "react-dom";
import { bind } from "./frame";
import { App } from "./app";
import { loadModule, setServer } from "@slye/core";

setServer({
  async fetchWAsm(moduleName: string): Promise<ArrayBuffer> {
    const { url } = await client.fetchWAsm(moduleName);
    const res = await fetch(url);
    return res.arrayBuffer();
  },
  async fetchModuleAsset(
    moduleName: string,
    assetKey: string
  ): Promise<ArrayBuffer> {
    console.log(moduleName, assetKey);
    return undefined;
  },
  async fetchAsset(
    presentationId: string,
    asset: string
  ): Promise<ArrayBuffer> {
    return undefined;
  }
});

async function init() {
  const m = await loadModule("slye");
  console.log(m);

  const root = document.getElementById("page");
  bind();
  ReactDOM.render(<App />, root);
}

document.addEventListener("readystatechange", () => {
  if (document.readyState === "complete") {
    init();
  }
});
