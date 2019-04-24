/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import React from "react";
import ReactDOM from "react-dom";
import { bind } from "./frame";
import { App } from "./app";

function init() {
  const root = document.getElementById("page");
  bind();
  ReactDOM.render(<App />, root);
}

document.addEventListener("readystatechange", () => {
  if (document.readyState === "complete") {
    init();
  }
});
