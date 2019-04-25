/*
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { promises as fs } from "fs";
import { JSONPresentation } from "@slye/core";
import * as path from "path";

type Meta = Record<string, string | number>;

export class PresentationFile {
  meta: Meta;
  slye: JSONPresentation;

  constructor(private readonly dir: string, private readonly uuid: string) {}

  private join(f: string): string {
    return path.join(this.dir, f);
  }

  close(): void {
    // Remove dir.
  }

  /**
   * Init a new presentation.
   *
   * @returns {undefined}
   */
  async init(): Promise<void> {
    this.meta = {
      uuid: this.uuid,
      created: Date.now()
    };
    this.slye = {
      template: {
        moduleName: "slye",
        component: "template"
      },
      steps: []
    };
    await Promise.all([
      fs.mkdir(this.join("assets")),
      fs.writeFile(this.join("sly.json"), "{}"),
      fs.writeFile(this.join("meta.json"), JSON.stringify(this.meta))
    ]);
  }

  async patchMeta(meta: Meta): Promise<void> {
    this.meta = {
      ...this.meta,
      ...meta
    };
    fs.writeFile(this.join("meta.json"), JSON.stringify(this.meta));
  }

  getMeta(): Meta {
    return this.meta;
  }
}
