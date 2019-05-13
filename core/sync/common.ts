/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

export type SyncCommand = SyncSlyCommand | SyncActionCommand;

export interface SyncSlyCommand {
  command: "sly";
  pd: string;
}

export interface SyncActionCommand {
  command: "action";
  action: any;
}

export const enum Words {
  COMPONENT = "0",
  DATA = "1",
  MODULE_NAME = "2",
  COMPONENT_NAME = "3",
  PROPS = "4",
  POSITION = "5",
  ROTATION = "6",
  SCALE = "7",
  STEP = "8",
  COMPONENTS = "9",
  FONT = "a",
  NAME = "b",
  FORWARD = "c",
  BACKWARD = "d",
  ACTION = "e"
}

export type SerializedComponent = {
  [Words.COMPONENT]: string; // UUID
  [Words.DATA]?: {
    [Words.MODULE_NAME]: string;
    [Words.COMPONENT_NAME]: string;
    [Words.PROPS]: ActionData;
    [Words.POSITION]: [number, number, number];
    [Words.ROTATION]: [number, number, number];
    [Words.SCALE]: [number, number, number];
  };
};

export type SerializedStep = {
  [Words.STEP]: string; // UUID
  [Words.DATA]?: {
    [Words.COMPONENTS]: SerializedComponent[];
    [Words.POSITION]: [number, number, number];
    [Words.ROTATION]: [number, number, number];
    [Words.SCALE]: [number, number, number];
  };
};

export type SerializedFont = {
  [Words.FONT]: {
    [Words.MODULE_NAME]: string;
    [Words.NAME]: string;
  };
};

export type SerializedActionData =
  | string
  | number
  | boolean
  | SerializedComponent
  | SerializedStep
  | SerializedFont
  | { _: ActionData }; // For nested data.

export type ActionData = {
  [K: string]: SerializedActionData;
};
