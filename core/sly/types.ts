/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

export enum RefKind {
  ASSET,
  FONT
}

export interface AssetRef {
  kind: RefKind.ASSET;
  key: string;
}

export interface FontRef {
  kind: RefKind.FONT;
  moduleName: string;
  font: string;
}

export type ComponentPropValue = AssetRef | FontRef | string | number;

export interface JSONPresentationComponent {
  moduleName: string;
  component: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  uuid: string;
  props: Record<string, ComponentPropValue>;
}

export interface JSONPresentationStep {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  components: JSONPresentationComponent[];
}

export interface JSONPresentation {
  template?: {
    moduleName: string;
    component: string;
  };
  steps: Record<string, JSONPresentationStep>;
}
