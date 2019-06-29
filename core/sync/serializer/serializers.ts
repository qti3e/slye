/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { FontBase } from "../../interfaces";
import { Unserializers, Serializers, Primary } from "./types";

export const serializers: (u: Unserializers) => Serializers = u => ({
  primary: {
    test(data): data is Primary {
      return (
        typeof data === "string" ||
        typeof data === "number" ||
        typeof data === "boolean" ||
        typeof data === "undefined" ||
        data === null
      );
    },
    serialize(data) {
      return data;
    },
    unserialize(data) {
      return data;
    }
  },
  font: {
    test(data): data is FontBase {
      return !!(data && typeof data === "object" && data.isSlyeFont);
    },
    serialize(data) {
      return {
        name: "X",
        moduleName: "X"
      };
    },
    ...u.font
  }
});
