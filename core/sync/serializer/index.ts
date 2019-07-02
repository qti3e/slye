/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Context, SerializedData, Serializers, Serialized, P } from "./types";

export function serialize(ctx: Context, data: any): SerializedData {
  const keys: (keyof Serializers)[] = Object.keys(ctx.serializers) as any;

  for (const key of keys) {
    const serializer = ctx.serializers[key];
    if (serializer.test(data)) {
      const serializedData = serializer.serialize.call(ctx, data);
      return {
        name: key,
        data: serializedData
      } as any;
    }
  }

  throw new Error("Can not serialize data.");
}

export function unserialize<T extends keyof Serializers>(
  ctx: Context,
  data: Serialized<T>
): Promise<P<T>>;

export function unserialize(ctx: Context, data: SerializedData): Promise<any> {
  const serializer = ctx.serializers[data.name];
  return serializer.unserialize.call(ctx, data.data);
}
