import Stats from "stats.js";

import * as THREE from "three";

import * as server from "../core/server";
import { loadModule, component } from "../core/module";

import { Presentation } from "../core/presentation";
import { Step } from "../core/step";
import { generateShapes } from "../core/draw";

import wasm from "../*.sm";
import slyeAssets from "../module/assets/*.ttf";

const assets: Record<string, Record<string, string>> = {
  slye: {}
};

for (const key in slyeAssets) {
  assets.slye[key + ".ttf"] = slyeAssets[key];
}

server.setServer({
  async fetchWAsm(moduleName: string): Promise<ArrayBuffer> {
    const path = wasm[moduleName];
    const res = await fetch(path);
    return res.arrayBuffer();
  },
  async fetchModuleAsset(
    moduleName: string,
    assetKey: string
  ): Promise<ArrayBuffer> {
    const path = assets[moduleName][assetKey];
    const res = await fetch(path);
    return res.arrayBuffer();
  }
});

async function main() {
  const m1 = await loadModule("slye");

  const p = new Presentation(window.innerWidth, window.innerHeight);

  const s1 = new Step();
  p.add(s1);

  const c1 = await component("slye", "text", {
    text: "سلام!",
    font: m1.font("homa")
  });
  s1.add(c1);

  const template = await component("slye", "template");
  p.setTemplate(template);

  (p as any).camera.position.z = 50;

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
  window.addEventListener("mousemove", p.onMove, false);

  render();
}

window.onload = main;
