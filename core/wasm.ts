import { SlyeComponent } from "./component";
import { SlyeModule } from "./module";

export class WAsm {
  private readonly memory: WebAssembly.Memory;
  private readonly table: WebAssembly.Table;
  private readonly instance: WebAssembly.Instance;

  private wait: Promise<void>;
  private waitResolve: () => void;

  private currentComponent: SlyeComponent;

  private readonly uint8: Uint8Array;

  constructor(private readonly mod: SlyeModule, buffer: ArrayBuffer) {
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
      _load_local: this.loadLocal.bind(this)
    };

    this.wait = new Promise(r => this.waitResolve = r);
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

  private readChar(ptr: number): string {
    const start = ptr;
    while (this.uint8[++ptr]);
    const sub = this.uint8.subarray(start, ptr);
    return String.fromCharCode(...sub);
  }

  private registerComponent(namePtr: number, cb: number): void {
    const name = this.readChar(namePtr);
    console.log(name);
  }

  private loadLocal(): number {
    return 0;
  }
}
