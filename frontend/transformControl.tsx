/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import React, { Component } from "react";
import * as THREE from "three";
import * as slye from "@slye/core";

const transformControls: WeakMap<
  slye.Renderer,
  THREE.TransformControls[]
> = new WeakMap();

export interface TransformControlProps {
  renderer: slye.Renderer;
  object?: THREE.Object3D;
  disabled?: boolean;
}

interface TransformControlState {
  mode: "rotate" | "translate" | "scale";
}

export class TransformControl extends Component<
  TransformControlProps,
  TransformControlState
> {
  state: TransformControlState = {
    mode: "translate"
  };

  private transformControl: THREE.TransformControls;
  private prevMode: "rotate" | "translate" | "scale";
  private prevVec3: slye.Vec3;

  constructor(props: TransformControlProps) {
    super(props);

    if (!props.renderer)
      throw new Error("TransformControl: `renderer` prop is required.");

    if (!transformControls.has(props.renderer))
      transformControls.set(props.renderer, []);
  }

  componentWillReceiveProps(nextProps: TransformControlProps) {
    if (nextProps.renderer !== this.props.renderer)
      throw new Error("TransformControl: `renderer` can not be changed.");

    if (nextProps.object !== this.props.object) this.save();

    this.updatePrevVec3(nextProps.object);
  }

  componentWillMount() {
    const { renderer } = this.props;
    const stack = transformControls.get(renderer);

    if (stack.length) {
      this.transformControl = stack.pop();
    } else {
      console.info("TransformControl: New Instance.");
      this.transformControl = new THREE.TransformControls(
        renderer.camera,
        renderer.domElement
      );
    }

    // Set the initial state value.
    this.state.mode = this.transformControl.mode;
    this.prevMode = this.state.mode;
    this.updatePrevVec3(this.props.object);

    renderer.scene.add(this.transformControl);
    document.addEventListener("keypress", this.onKeypress);
    renderer.domElement.addEventListener("mouseup", this.onMouseup);
  }

  componentWillUnmount() {
    this.save();
    const { renderer } = this.props;
    renderer.scene.remove(this.transformControl);
    this.transformControl.detach();
    this.transformControl.enabled = false;
    // Unbind events.
    document.removeEventListener("keypress", this.onKeypress);
    renderer.domElement.removeEventListener("mouseup", this.onMouseup);
    // Release the transform control.
    const stack = transformControls.get(renderer);
    stack.push(this.transformControl);
    // When should we call dispose?
  }

  onKeypress = (event: KeyboardEvent): void => {
    if (!this.transformControl.enabled) return;
    const { keyCode: c } = event;
    // [R]otate - [S]cale - [T]ranslate
    // Key Codes: { R: 82, S: 83, T: 84 }
    const mode = ["rotate", "scale", "translate"][c - (c >= 114 ? 114 : 82)];
    if (mode) {
      this.setState({ mode: mode as any });
      event.preventDefault();
      return;
    }
  };

  onMouseup = (event: MouseEvent): void => {
    this.save();
  };

  save = () => {
    const mode = this.prevMode;
    const obj = this.props.object;
    let slyeObj = obj.userData.component || obj.userData.step;
    if (
      !(
        slyeObj instanceof slye.ThreeComponent ||
        slyeObj instanceof slye.ThreeStep
      )
    )
      return;

    const currentVec3 =
      mode === "rotate"
        ? slyeObj.getRotation()
        : mode === "scale"
        ? slyeObj.getScale()
        : slyeObj.getPosition();

    if (this.prevVec3 && eq(this.prevVec3, currentVec3)) return;

    this.props.renderer.actions.transform(
      mode,
      slyeObj,
      this.prevVec3,
      currentVec3
    );

    this.prevVec3 = currentVec3;
  };

  updatePrevVec3 = (obj: THREE.Object3D) => {
    let slyeObj = obj.userData.component || obj.userData.step;
    if (
      slyeObj instanceof slye.ThreeComponent ||
      slyeObj instanceof slye.ThreeStep
    )
      this.prevVec3 =
        this.prevMode === "rotate"
          ? slyeObj.getRotation()
          : this.prevMode === "scale"
          ? slyeObj.getScale()
          : slyeObj.getPosition();
  };

  render() {
    if (this.props.object) this.transformControl.attach(this.props.object);
    this.transformControl.mode = this.state.mode;
    const prevEnabled = this.transformControl.enabled;
    this.transformControl.enabled = !!this.props.object && !this.props.disabled;
    const enabledChanged = prevEnabled !== this.transformControl.enabled;

    if (this.state.mode !== this.prevMode) {
      // Save according to the prev mode.
      this.save();
      // Update the mode and prevVec3 value.
      this.prevMode = this.state.mode;
      this.updatePrevVec3(this.props.object);
    } else if (enabledChanged && prevEnabled) {
      this.save();
    }

    return <div />;
  }
}

function eq(a: slye.Vec3, b: slye.Vec3): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}
