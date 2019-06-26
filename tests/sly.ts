/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { assert, assertEqual, test } from "liltest";

import * as three from "../core/three";
import * as headless from "../core/headless";
import * as sly from "../core/sly";

test(async function slyEncoder() {
  const f1 = new headless.HeadlessFont("slye", "homa");

  const p1 = new headless.HeadlessPresentation("p1");
  const s1 = new headless.HeadlessStep("s1");
  const s2 = new headless.HeadlessStep("s2");
  const c1 = new headless.HeadlessComponent("c1", "slye", "text", {
    p1: "value",
    font: f1
  });
  const c2 = new headless.HeadlessComponent("c2", "slye", "pic", {
    src: "D"
  });
  const c3 = new headless.HeadlessComponent("c3", "slye", "pic", {
    src: "D"
  });

  p1.add(s1);
  p1.add(s2);
  s1.add(c1);
  s1.add(c2);
  s1.add(c3);

  s1.setPosition(1, 2, 3);
  s1.setRotation(4, 5, 6);
  s2.setPosition(7, 8, 9);
  s2.setRotation(10, 11, 12);
  c1.setPosition(13, 14, 15);
  c1.setRotation(16, 17, 18);
  c2.setPosition(19, 20, 21);
  c2.setRotation(22, 23, 24);
  c3.setPosition(25, 26, 27);
  c3.setRotation(28, 29, 30);

  const actual = sly.encode(p1);
  const expected = {
    template: undefined,
    steps: {
      s1: {
        position: [1, 2, 3],
        rotation: [4, 5, 6],
        scale: [1, 1, 1],
        components: [
          {
            uuid: "c1",
            moduleName: "slye",
            component: "text",
            position: [13, 14, 15],
            rotation: [16, 17, 18],
            scale: [1, 1, 1],
            props: {
              p1: "value",
              font: { kind: 1, font: "homa", moduleName: "slye" }
            }
          },
          {
            uuid: "c2",
            moduleName: "slye",
            component: "pic",
            position: [19, 20, 21],
            rotation: [22, 23, 24],
            scale: [1, 1, 1],
            props: { src: "D" }
          },
          {
            uuid: "c3",
            moduleName: "slye",
            component: "pic",
            position: [25, 26, 27],
            rotation: [28, 29, 30],
            scale: [1, 1, 1],
            props: { src: "D" }
          }
        ]
      },
      s2: {
        position: [7, 8, 9],
        rotation: [10, 11, 12],
        scale: [1, 1, 1],
        components: []
      }
    }
  };

  assertEqual(actual, expected);
});

test(async function slyDecoder() {
  const data = {
    template: undefined,
    steps: {
      s1: {
        position: [1, 2, 3],
        rotation: [4, 5, 6],
        scale: [1, 1, 1],
        components: [
          {
            uuid: "c1",
            moduleName: "slye",
            component: "text",
            position: [13, 14, 15],
            rotation: [16, 17, 18],
            scale: [1, 1, 1],
            props: {
              p1: "value",
              font: { kind: 1, font: "homa", moduleName: "slye" }
            }
          },
          {
            uuid: "c2",
            moduleName: "slye",
            component: "pic",
            position: [19, 20, 21],
            rotation: [22, 23, 24],
            scale: [1, 1, 1],
            props: { src: "D" }
          },
          {
            uuid: "c3",
            moduleName: "slye",
            component: "pic",
            position: [25, 26, 27],
            rotation: [28, 29, 30],
            scale: [1, 1, 1],
            props: { src: "D" }
          }
        ]
      },
      s2: {
        position: [7, 8, 9],
        rotation: [10, 11, 12],
        scale: [1, 1, 1],
        components: []
      }
    }
  };

  const p = new three.ThreePresentation("p1");
  await sly.sly(p, data as any);

  const data2 = sly.encode(p);
  assertEqual(data, data2);
});
