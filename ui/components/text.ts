/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { MDCFloatingLabel } from "@material/floating-label";
import { e, WrappedElement } from "../dom";

export function createTextInput(
  label: string
): WrappedElement<HTMLDivElement, HTMLInputElement> {
  let labelEl: HTMLElement;
  let el: HTMLInputElement;

  const wrapper = e(
    "div",
    {
      class: ["mdc-text-field", "mdc-text-field--outlined"]
    },
    [
      (el = e("input", {
        type: "text",
        class: "mdc-text-field__input"
      })),
      e(
        "div",
        {
          class: "mdc-notched-outline"
        },
        [
          e("div", { class: "mdc-notched-outline__leading" }),
          e("div", { class: "mdc-notched-outline__notch" }, [
            (labelEl = e("label", { class: "mdc-floating-label" }, label))
          ]),
          e("div", { class: "mdc-notched-outline__trailing" })
        ]
      )
    ]
  );

  const floating = new MDCFloatingLabel(labelEl);
  el.addEventListener("focus", () => floating.float(true));
  el.addEventListener("blur", () => floating.float(false));

  return {
    wrapper,
    el
  };
}
