/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { fetchWAsm } from "./server";
import { Component, ComponentInit, SlyeComponent } from "./component";

const modulesTable: Map<string, Module> = new Map();

export interface Module {
  component(name: string): Component;
}

export interface WAsmInterface {
  use(c: SlyeComponent): void;
}

export class ModuleImpl implements Module {
  private readonly components: Map<string, ComponentInit> = new Map();

  private readonly memory: WebAssembly.Memory;
  private readonly table: WebAssembly.Table;
  private readonly instance: WebAssembly.Instance;

  private wait: Promise<void>;
  private waitResolve: () => void;

  private currentComponent: SlyeComponent;

  private readonly uint8: Uint8Array;

  constructor(buffer: ArrayBuffer) {
    this.memory = new WebAssembly.Memory({
      initial: 512
    });

    this.table = new WebAssembly.Table({
      // I don't actually know the range that is suitable for this,
      // so just use my lucky number.
      initial: 27,
      maximum: 54,
      element: "anyfunc"
    });

    const env = {
      memory: this.memory,
      table: this.table,
      __memory_base: 0,
      __table_base: 0,
      // Callables.
      abort() {},
      _register_component: this.registerComponent.bind(this),
      _load_local: this.loadLocal.bind(this),
      _slog: this.slog.bind(this)
    };

    this.wait = new Promise(r => (this.waitResolve = r));
    WebAssembly.instantiate(buffer, { env }).then(ret => {
      (this as any).instance = ret.instance;
      this.waitResolve();
    });

    this.uint8 = new Uint8Array(this.memory.buffer);
  }

  async init(): Promise<number> {
    await this.wait;
    this.waitResolve = undefined;
    this.wait = undefined;
    return this.instance.exports._init();
  }

  use(c: SlyeComponent): void {
    this.currentComponent = c;
  }

  component(name: string): SlyeComponent {
    const init = this.components.get(name);
    const c = new SlyeComponent();
    c.use = () => this.use(c);

    c.use();
    init();

    return c;
  }

  private readChar(ptr: number): string {
    const start = ptr;
    while (this.uint8[++ptr]);
    const sub = this.uint8.subarray(start, ptr);
    return String.fromCharCode(...sub);
  }

  // === EXPORTED WASM FUNCTIONS ===

  private slog(msgPtr: number): void {
    console.log("wasm-log:", this.readChar(msgPtr));
  }

  private registerComponent(namePtr: number, cb: number): void {
    const name = this.readChar(namePtr);
    const init = this.table.get(cb);
    this.components.set(name, init);
  }

  private loadLocal(): number {
    return 0;
  }
}

/**
 * Loads a wasm file and register it as a module.
 */
export async function loadModule(name: string): Promise<Module> {
  if (modulesTable.has(name)) return modulesTable.get(name);

  const buf = await fetchWAsm(name);
  const wasm = new ModuleImpl(buf);
  await wasm.init();

  modulesTable.set(name, wasm);
  return wasm;
}

export async function component(
  moduleName: string,
  componentName: string
): Promise<Component> {
  const m = await loadModule(moduleName);
  return m.component(componentName);
}
