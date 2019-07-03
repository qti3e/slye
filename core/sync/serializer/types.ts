/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { StepBase, ComponentBase, FontBase, FileBase } from "../../interfaces";

export type Primary = number | string | boolean | null | undefined;

export interface Context {
  serializers: Serializers;
  fonts: Map<string, FontBase>;
  components: Map<string, ComponentBase>;
  steps: Map<string, StepBase>;
  files: Map<string, FileBase>;
  presentationUUID: string;
}

export interface Serializer<P, T> {
  test(data: any): data is P;
  serialize(this: Context, data: P): T;
  unserialize(this: Context, data: T): Promise<P>;
}

export interface Unserializer<P, T> {
  unserialize(this: Context, data: T): Promise<P>;
}

type V3 = [number, number, number];

export type Serializers = {
  primary: Serializer<Primary, Primary>;
  object: Serializer<Record<string, any>, Record<string, SerializedData>>;
  font: Serializer<FontBase, { name: string; file: Serialized<"file"> }>;
  step: Serializer<
    StepBase,
    {
      uuid: string;
      data?: {
        position: V3;
        rotation: V3;
        scale: V3;
        components: Serialized<"component">[];
      };
    }
  >;
  component: Serializer<
    ComponentBase,
    {
      uuid: string;
      data?: {
        position: V3;
        scale: V3;
        rotation: V3;
        moduleName: string;
        componentName: string;
        props: Serialized<"object">;
      };
    }
  >;
  file: Serializer<
    FileBase,
    {
      uuid: string;
      moduleName?: string;
    }
  >;
};

export type Unserializers = {
  font: U<"font">;
  step: U<"step">;
  component: U<"component">;
  file: U<"file">;
};

export type SerializedData = {
  [K in keyof Serializers]: {
    name: K;
    data: T<K>;
  }
}[keyof Serializers];

export type Serialized<K extends keyof Serializers> = {
  name: K;
  data: T<K>;
};

// Utils.

export type P<K extends keyof Serializers> = Serializers[K] extends Serializer<
  infer P,
  any
>
  ? P
  : never;

export type T<K extends keyof Serializers> = Serializers[K] extends Serializer<
  any,
  infer T
>
  ? T
  : never;

type U<K extends keyof Serializers> = Unserializer<P<K>, T<K>>;
