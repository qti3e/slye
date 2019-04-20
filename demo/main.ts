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

  const c1 = await component("slye", "text");
  s1.add(c1);

  p.add(s1);

  console.log(m1.getFonts());
  const f1 = m1.font("homa");
  const layout = await f1.layout("سلام");
  const shape = generateShapes(layout, 5);
  console.log(shape);

  var extrudeSettings = {
    steps: 2,
    depth: 2,
    bevelEnabled: false,
    bevelThickness: 1,
    bevelSize: 1,
    bevelSegments: 1
  };

  var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  var material = new THREE.MeshPhongMaterial({
    color: 0x156289,
    emissive: 0x072534,
    side: THREE.DoubleSide,
    flatShading: true
  });
  var mesh = new THREE.Mesh(geometry, material);

  var lights = [];
  lights[0] = new THREE.PointLight(0xffffff, 1, 0);
  lights[1] = new THREE.PointLight(0xffffff, 1, 0);
  lights[2] = new THREE.PointLight(0xffffff, 1, 0);

  lights[0].position.set(0, 200, 0);
  lights[1].position.set(100, 200, 100);
  lights[2].position.set(-100, -200, -100);

  p.scene.add(lights[0]);
  p.scene.add(lights[1]);
  p.scene.add(lights[2]);

  p.camera.position.z = 50;
  p.scene.add(mesh);

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
