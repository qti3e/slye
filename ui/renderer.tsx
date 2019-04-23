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
import css from "./app.scss";

const styleElement = document.createElement("style");
styleElement.type = "text/css";
styleElement.innerHTML = css;
document.head.appendChild(styleElement);

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
