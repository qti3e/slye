/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

export interface Server {
  fetchWAsm(moduleName: string): Promise<ArrayBuffer>;
  fetchModuleAsset(moduleName: string, assetKey: string): Promise<ArrayBuffer>;
}

let current_server: Server;

export function setServer(s: Server): void {
  current_server = s;
}

export function fetchWAsm(moduleName: string): Promise<ArrayBuffer> {
  return current_server.fetchWAsm(moduleName);
}

export function fetchModuleAsset(
  moduleName: string,
  assetKey: string
): Promise<ArrayBuffer> {
  return current_server.fetchModuleAsset(moduleName, assetKey);
}
