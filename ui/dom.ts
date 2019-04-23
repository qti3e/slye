/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

type Without<T, K> = Pick<T, Exclude<keyof T, K>>;
type ClassProp = string[] | string;
type StyleProp = Record<string, string> | string;

export interface WrappedElement<W = HTMLElement, E = HTMLElement> {
  wrapper: W;
  el: E;
}

function setClass(e: HTMLElement, c: ClassProp): void {
  if (typeof c === "string") {
    e.className = c;
  } else {
    for (const n of c) {
      e.classList.add(n);
    }
  }
}

function setStyle(e: HTMLElement, s: StyleProp): void {
  if (typeof s === "string") {
    e.setAttribute("style", s);
  } else {
    for (const n in s) {
      if (s.hasOwnProperty(n)) {
        (e.style as any)[n] = s[n];
      }
    }
  }
}

export function e<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Without<Partial<HTMLElementTagNameMap[K]>, "class" | "style"> & {
    class?: ClassProp;
  } & { style?: StyleProp },
  childs?: (HTMLElement | WrappedElement)[] | string
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const key in props) {
    const prop = (props as any)[key];
    if (key === "class") {
      setClass(el, prop);
    }
    if (key === "style") {
      setStyle(el, prop);
    } else if (typeof prop === "string") {
      el.setAttribute(key, prop);
    } else {
      console.warn(`Unused element attribute ${key}.`);
    }
  }

  if (!childs) return el;

  if (typeof childs === "string") {
    el.innerText = childs;
    return el;
  }

  for (const child of childs) {
    if (child instanceof HTMLElement) {
      el.appendChild(child);
    } else {
      el.appendChild(child.wrapper);
    }
  }

  return el;
}

e(
  "a",
  {
    href: "S",
    class: ["S", "D"],
    style: {
      X: "y"
    }
  },
  []
);
