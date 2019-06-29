/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { StepBase, ComponentBase, FontBase } from "../../interfaces";

export type Primary = number | string | boolean | null | undefined;

export interface Context {
  serializers: Serializers;
  fonts: Map<string, FontBase>;
  components: Map<string, ComponentBase>;
  steps: Map<string, StepBase>;
  presentationUUID: string;
}

export interface Serializer<P, T> {
  test(data: any): data is P;
  serialize(this: Context, data: P): T;
  unserialize(this: Context, data: T): P;
}

export interface Unserializer<P, T> {
  unserialize(this: Context, data: T): P;
}

export type Serializers = {
  primary: Serializer<Primary, Primary>;
  font: Serializer<FontBase, { name: string; moduleName: string }>;
};

export type Unserializers = {
  font: U<"font">;
};

export type SerializedData = {
  [K in keyof Serializers]: {
    name: K;
    data: T<K>;
  }
}[keyof Serializers];

// Utils.

type P<K extends keyof Serializers> = Serializers[K] extends Serializer<
  infer P,
  any
>
  ? P
  : never;

type T<K extends keyof Serializers> = Serializers[K] extends Serializer<
  any,
  infer T
>
  ? T
  : never;

type U<K extends keyof Serializers> = Unserializer<P<K>, T<K>>;
