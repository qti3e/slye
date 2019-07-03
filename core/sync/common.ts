/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Unserializers, Context } from "./serializer/types";
import { serializers } from "./serializer/serializers";
import { serialize, unserialize } from "./serializer";
import { Serializer } from "./types";
import { ActionTypes } from "../actions";

export function createSerializer(unserializers: Unserializers) {
  return class XSerializer implements Serializer {
    readonly ctx: Context;

    constructor() {
      this.ctx = {
        serializers: serializers(unserializers),
        fonts: new Map(),
        components: new Map(),
        steps: new Map(),
        files: new Map(),
        presentationUUID: undefined
      };
    }

    serialize(forward: boolean, action: keyof ActionTypes, data: any): string {
      return JSON.stringify({
        forward,
        action,
        data: serialize(this.ctx, data)
      });
    }

    async unserialize(text: string): Promise<any> {
      const raw = JSON.parse(text);
      console.log(JSON.stringify(raw, null, 4));
      const data = await unserialize(this.ctx, raw.data);
      return {
        forward: !!raw.forward,
        action: raw.action,
        data: data
      };
    }
  };
}
