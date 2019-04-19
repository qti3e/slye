import Stats from "stats.js";

import * as server from "../core/server";
import { loadModule, component } from "../core/module";

import { Presentation } from "../core/presentation";
import { Step } from "../core/step";

import wasm from "../*.sm";

server.setServer({
  async fetchWAsm(moduleName: string): Promise<ArrayBuffer> {
    const path = wasm[moduleName];
    const res = await fetch(path);
    return res.arrayBuffer();
  },
  fetchModuleAsset(moduleName: string, assetKey: string): Promise<ArrayBuffer> {
    return null;
  }
});

async function main() {

  await loadModule("slye");

  const p = new Presentation(window.innerWidth, window.innerHeight);

  const s1 = new Step();

  const c1 = await component("slye", "text");
  s1.add(c1);

  p.add(s1);

  document.body.appendChild(p.domElement);

  const stats = new Stats();
  document.body.appendChild(stats.dom);

  function render() {
    stats.begin();
    p.render();
    stats.end();

    window.requestAnimationFrame(render);
  }

  function onWindowResize() {
    p.resize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener("click", p.onClick, false);

  render();
}

window.onload = main;
