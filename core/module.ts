/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { WAsm } from "./wasm";
import { fetchWAsm } from "./server";
import { SlyeComponent } from "./component";

/**
 * An Slye module is a module that is already loaded into the memory
 * and is ready to be used.
 */
export class SlyeModule {
}

/**
 * Loads a wasm file and register it as a module.
 */
export async function loadModule(src: string): Promise<SlyeModule> {
  const buf = await fetchWAsm(src);
  const m = new SlyeModule();
  const wasm = new WAsm(m, buf);
  await wasm.init();
  return m;
}
