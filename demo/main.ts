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

  const template = await component("slye", "template");
  p.setTemplate(template);

  const s1 = new Step();
  p.add(s1);

  const c1 = await component("slye", "text", {
    text: "سلام!",
    font: m1.font("homa")
  });
  s1.add(c1);

  const s2 = new Step();
  p.add(s2);

  const c2 = await component("slye", "text", {
    text: "سلام! این یک متن بلند تر است.",
    font: m1.font("sahel")
  });
  s2.add(c2);
  s2.setPosition(20, 10, 0);
  s2.setRotation(THREE.Math.degToRad(45), THREE.Math.degToRad(5), THREE.Math.degToRad(10));

  (p as any).camera.position.z = 50;

  document.body.appendChild(p.domElement);
  (window as any).p = p;
  (window as any).THREE = THREE;

  p.goTo(0);

  // Events

  const stats = new Stats();
  document.body.appendChild(stats.dom);

  function goToPrev() {
    p.prev();
  }

  function goToNext() {
    p.next();
  }

  function render() {
    stats.begin();
    p.render();
    stats.end();

    window.requestAnimationFrame(render);
  }

  function onWindowResize() {
    p.resize(window.innerWidth, window.innerHeight);
  }

  function keydown(event: KeyboardEvent) {
    if (event.keyCode === 9 ||
      (event.keyCode >= 32 && event.keyCode <= 34) ||
      (event.keyCode >= 37 && event.keyCode <= 40)) {
      event.preventDefault();
    }
  }

  function keyup(event: KeyboardEvent) {
    switch (event.keyCode) {
      case 33: // pg up
      case 37: // left
      case 38: // up
        goToPrev();
        break;
      case 9:  // tab
      case 32: // space
      case 34: // pg down
      case 39: // right
      case 40: // down
        goToNext();
        break;
    }
    keydown(event);
  }

  function touchstart(event: TouchEvent) {
    if (event.touches.length === 1) {
      const x = event.touches[0].clientX;
      const width = innerWidth * 0.3;
      if (x < width) {
        goToPrev();
      } else if (x > innerWidth - width) {
        goToNext();
      }
    }
  }

  document.addEventListener("keydown", keydown);
  document.addEventListener("keyup", keyup);
  document.addEventListener("touchstart", touchstart);
  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener("click", p.onClick, false);
  window.addEventListener("mousemove", p.onMove, false);

  render();
}

window.onload = main;
