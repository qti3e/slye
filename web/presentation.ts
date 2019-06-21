/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { JSONPresentation, JSONPresentationStep } from "../core/sly";
import { HeadlessSerializer } from "../core/sync/headlessSerializer";
import { Sync } from "../core/sync/sync";
import { headlessDecode } from "../core/sly/headlessDecoder";
import * as headless from "../core/headless";
import uuidv1 from "uuid/v1";
import EventEmitter from "eventemitter3";

export const presentations: Map<string, Presentation> = new Map();
export const ee = new EventEmitter();

type Meta = Record<string, string | number>;

export class Presentation {
  readonly uuid: string;
  readonly meta: Meta;
  readonly assets: Map<string, string> = new Map();
  private presentation: headless.HeadlessPresentation;

  constructor() {
    this.uuid = uuidv1();
    this.meta = {};

    presentations.set(this.uuid, this);
  }

  open(sly: JSONPresentation): void {
    const pd = this.uuid;
    this.presentation = new headless.HeadlessPresentation(pd);

    const sync = new Sync(
      this.presentation,
      new HeadlessSerializer(),
      {
        onMessage(handler: (msg: string) => void): void {
          ee.on(`p${pd}`, (msg: string) => {
            handler(msg);
          });
        },
        send(msg: string): void {
          setTimeout(() => ee.emit(`p${pd}-x`, msg));
        }
      },
      headlessDecode,
      true
    );

    sync.open(sly);
  }

  patchMeta(m2: Meta): void {
    Object.assign(this.meta, m2);
  }
}
