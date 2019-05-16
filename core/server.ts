/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { FileBase } from "./interfaces/file";

// TODO(qti3e) Move this file to binding.ts

export interface Server {
  requestModule(moduleName: string): Promise<boolean>;
  fetchModuleAsset(moduleName: string, assetKey: string): Promise<ArrayBuffer>;
  fetchAsset(presentationId: string, assetKey: string): Promise<ArrayBuffer>;
  showFileDialog(presentationId: string): Promise<FileBase[]>;
}

let current_server: Server;

export function setServer(s: Server): void {
  current_server = s;
}

export function requestModule(moduleName: string): Promise<boolean> {
  return current_server.requestModule(moduleName);
}

export function fetchModuleAsset(
  moduleName: string,
  assetKey: string
): Promise<ArrayBuffer> {
  return current_server.fetchModuleAsset(moduleName, assetKey);
}
export function fetchAsset(
  presentationId: string,
  assetKey: string
): Promise<ArrayBuffer> {
  return current_server.fetchAsset(presentationId, assetKey);
}

export function showFileDialog(presentationId: string): Promise<FileBase[]> {
  return current_server.showFileDialog(presentationId);
}
