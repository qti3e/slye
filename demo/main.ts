import * as server from "../core/server";
import { loadModule } from "../core/module";

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
  const m1 = await loadModule("slye");
  m1.component("text");
}

window.onload = main;
