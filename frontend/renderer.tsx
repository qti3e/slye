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
import { Main } from "./main";

import * as Slye from "@slye/core";
import * as Three from "three";

// For module loader & THREE modules.
window.slye = Slye;
window.THREE = Three;

import "three/examples/js/controls/TransformControls";
import "three/examples/js/controls/OrbitControls";
import "three/examples/js/controls/MapControls";

Slye.setServer({
  requestModule(moduleName: string): Promise<boolean> {
    console.log("req module", moduleName);
    return new Promise(async resolve => {
      const url = await client.getModuleMainURL(moduleName);
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = url;
      script.onload = () => resolve(true);
      document.head.appendChild(script);
    });
  },
  async fetchModuleAsset(
    moduleName: string,
    assetKey: string
  ): Promise<ArrayBuffer> {
    const url = await client.getModuleAssetURL(moduleName, assetKey);
    const res = await fetch(url);
    return res.arrayBuffer();
  },
  async fetchAsset(
    presentationId: string,
    asset: string
  ): Promise<ArrayBuffer> {
    const url = await client.getAssetURL(presentationId, asset);
    const res = await fetch(url);
    return res.arrayBuffer();
  }
});

async function init() {
  const root = document.getElementById("page");
  bind();
  ReactDOM.render(<Main />, root);
}

document.addEventListener("readystatechange", () => {
  if (document.readyState === "complete") {
    init();
  }
});
