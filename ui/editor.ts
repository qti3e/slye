/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { createTextInput } from "./components/text";

export function editor(wrapper: HTMLElement): void {
  const fragment = document.createDocumentFragment();

  const btn = document.createElement("button");
  btn.classList.add("foo-button");
  btn.classList.add("mdc-button");
  btn.innerText = "Hey!";

  const title = createTextInput("Your Name");

  fragment.appendChild(title.wrapper);
  fragment.appendChild(btn);

  wrapper.appendChild(fragment);
}
