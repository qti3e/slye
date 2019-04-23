/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { bind } from "./frame";
import { render } from "./app";
import css from "./app.scss";

document.addEventListener("readystatechange", () => {
  const styleElement = document.createElement("style");
  styleElement.type = "text/css";
  styleElement.innerHTML = css;
  document.head.appendChild(styleElement);

  if (document.readyState === "complete") {
    const root = document.getElementById("page");
    bind();
    render(root);
  }
});
