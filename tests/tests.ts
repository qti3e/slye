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

import * as headless from "../core/headless";

test(async function headlessComponent() {
  const c1 = new headless.HeadlessComponent("c1", "slye", "text", {
    p1: "value",
    p2: 5
  });

  assertEqual(c1.isSlyeComponent, true);
  assertEqual(c1.owner, undefined);
  assertEqual(c1.uuid, "c1");
  assertEqual(c1.moduleName, "slye");
  assertEqual(c1.componentName, "text");

  // Test props.
  assertEqual(c1.props.p1, "value");
  assertEqual(c1.props.p2, 5);
  assertEqual(c1.getProp("p1"), "value");
  assertEqual(c1.getProp("p2"), 5);

  // Test patch props.
  const patch = {
    p2: 7,
    p3: true
  };

  c1.patchProps(patch);
  assertEqual(c1.props.p1, "value");
  assertEqual(c1.props.p2, 7);
  assertEqual(c1.props.p3, true);
  assertEqual(c1.getProp("p3"), true);

  // Test position, rotation, scale methods.
  assertEqual(c1.getPosition(), { x: 0, y: 0, z: 0 });
  assertEqual(c1.getRotation(), { x: 0, y: 0, z: 0 });
  assertEqual(c1.getScale(), { x: 1, y: 1, z: 1 });

  c1.setPosition(1, 2, 3);
  c1.setRotation(4, 5, 6);
  c1.setScale(7, 8, 9);

  assertEqual(c1.getPosition(), { x: 1, y: 2, z: 3 });
  assertEqual(c1.getRotation(), { x: 4, y: 5, z: 6 });
  assertEqual(c1.getScale(), { x: 7, y: 8, z: 9 });
});

test(async function headlessStep() {
  const s1 = new headless.HeadlessStep("s1");

  assertEqual(s1.isSlyeStep, true);
  assertEqual(s1.uuid, "s1");
  assertEqual(s1.owner, undefined);
  assertEqual(s1.components, []);

  // Test position, rotation, scale methods.
  assertEqual(s1.getPosition(), { x: 0, y: 0, z: 0 });
  assertEqual(s1.getRotation(), { x: 0, y: 0, z: 0 });
  assertEqual(s1.getScale(), { x: 1, y: 1, z: 1 });

  s1.setPosition(1, 2, 3);
  s1.setRotation(4, 5, 6);
  s1.setScale(7, 8, 9);

  assertEqual(s1.getPosition(), { x: 1, y: 2, z: 3 });
  assertEqual(s1.getRotation(), { x: 4, y: 5, z: 6 });
  assertEqual(s1.getScale(), { x: 7, y: 8, z: 9 });

  // Test components.
  const c1 = new headless.HeadlessComponent("c1", "slye", "text", {});
  const c2 = new headless.HeadlessComponent("c1", "slye", "text", {});

  // Nothing should happen.
  s1.del(c1);

  // Add component to the step.
  s1.add(c1);
  assertEqual(c1.owner, s1);
  assertEqual(s1.components, [c1]);
  // Add another component.
  s1.add(c2);
  assertEqual(c2.owner, s1);
  assertEqual(s1.components, [c1, c2]);
  // Now remove c1.
  s1.del(c1);
  assertEqual(c1.owner, undefined);
  assertEqual(s1.components, [c2]);

  // Test changing ownership.
  const s2 = new headless.HeadlessStep("s2");
  s2.add(c2);
  assertEqual(c2.owner, s2);
  assertEqual(s1.components, []);
  assertEqual(s2.components, [c2]);
});

test(async function headlessPresentation() {
  const p1 = new headless.HeadlessPresentation("p1");

  assertEqual(p1.isSlyePresentation, true);
  assertEqual(p1.steps, []);
  assertEqual(p1.uuid, "p1");

  const s1 = new headless.HeadlessStep("s1");
  const s2 = new headless.HeadlessStep("s2");

  // Test steps.
  assertEqual(p1.getStepId(s1), -1);

  // Nothing should happen.
  p1.del(s1);

  // Add component to the step.
  p1.add(s1);
  assertEqual(s1.owner, p1);
  assertEqual(p1.steps, [s1]);
  // Add another component.
  p1.add(s2);
  assertEqual(s2.owner, p1);
  assertEqual(p1.steps, [s1, s2]);
  // Now remove s1.
  p1.del(s1);
  assertEqual(s1.owner, undefined);
  assertEqual(p1.steps, [s2]);

  // Test changing ownership.
  const p2 = new headless.HeadlessPresentation("p2");
  p2.add(s2);
  assertEqual(s2.owner, p2);
  assertEqual(p1.steps, []);
  assertEqual(p2.steps, [s2]);
});

test(async function headlessFont() {
  const f1 = new headless.HeadlessFont("slye", "homa");
  assertEqual(f1.isSlyeFont, true);
  assertEqual(f1.moduleName, "slye");
  assertEqual(f1.name, "homa");
  // Layout should throw an error.
  let err: Error;
  try {
    await f1.layout("Hello World");
    assert(false);
  } catch (e) {
    err = e;
  }
  assert(err instanceof Error);
});
