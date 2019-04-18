import { Component } from "./component";

/**
 * An Slye module is a module that is already loaded into the memory
 * and is ready to be used.
 */
class SlyeModule {
  /**
   * Name of the module.
   */
  name: string;

  /**
   * Memory buffer of the WAsm object.
   */
  private buffer: Uint8Array;

  /**
   * Name of registered components.
   */
  private components: string[];

  createComponent(
    component: string[],
    stepId: string,
    props: Record<string, number | string>
  ): Component {
    return null;
  }
}

/**
 * Loads a wasm file and register it as a module.
 */
export async function loadModule(src: string): Promise<SlyeModule> {
  return null;
}
