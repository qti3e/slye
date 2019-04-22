import Stats from "stats.js";

import * as THREE from "three";

import * as server from "../core/server";
import { loadModule } from "../core/module";

import { Presentation } from "../core/presentation";
import { RefKind, sly } from "../core/sly";

import wasm from "../*.sm";
import slyeAssets from "../module/assets/*.ttf";

import img from "./assets/img.jpg";
import pdbSrc from "./assets/ethanol.pdb";

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
  },
  async fetchAsset(
    presentationId: string,
    asset: string
  ): Promise<ArrayBuffer> {
    const path = img; // Just for now.
    const res = await fetch(path);
    return res.arrayBuffer();
  }
});

async function main() {
  const m1 = await loadModule("slye");

  const p = new Presentation("P1", window.innerWidth, window.innerHeight);
  const d = THREE.Math.degToRad;

  sly(p, {
    steps: [
      {
        position: [0, 0, 0] as any,
        rotation: [0, 0, 0] as any,
        components: [
          {
            moduleName: "slye",
            component: "text",
            position: [0, 0, 0] as any,
            rotation: [0, 0, 0] as any,
            props: {
              text: "سلام!",
              font: {
                kind: RefKind.FONT,
                moduleName: "slye",
                font: "homa"
              }
            }
          },
          {
            moduleName: "slye",
            component: "picture",
            position: [0, 0, 0] as any,
            rotation: [0, d(35), 0] as any,
            props: {
              img: {
                kind: RefKind.ASSET,
                key: "img.jpg"
              },
              width: 19.2,
              height: 10.8
            }
          }
        ]
      },
      {
        position: [20, 10, 0] as any,
        rotation: [d(45), d(5), d(10)] as any,
        components: [
          {
            moduleName: "slye",
            component: "text",
            position: [0, 0, 0] as any,
            rotation: [0, 0, 0] as any,
            props: {
              text: "سلام! این یک متن طولانی تر است.",
              font: {
                kind: 1,
                moduleName: "slye",
                font: "homa"
              }
            }
          }
        ]
      }
    ]
  });

  // Just for now.
  const worldScene = (p as any).scene as THREE.Scene;
  worldScene.background = new THREE.Color(0xbfd1e5);
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 200, 0);
  worldScene.add(hemiLight);
  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(-30, 100, -100);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 100;
  dirLight.shadow.camera.bottom = -10;
  dirLight.shadow.camera.left = -10;
  dirLight.shadow.camera.right = 10;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  worldScene.add(dirLight);

  document.body.appendChild(p.domElement);

  // Debugging
  (window as any).p = p;
  (window as any).THREE = THREE;

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
    if (
      event.keyCode === 9 ||
      (event.keyCode >= 32 && event.keyCode <= 34) ||
      (event.keyCode >= 37 && event.keyCode <= 40)
    ) {
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
      case 9: // tab
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
