/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Remote } from "electron";
import { Client } from "./client";

declare global {
  interface Window {
    remote: Remote;
    client: Client;
  }
  const client: Client;
}
