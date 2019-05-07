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

const transformControls: Map<string, THREE.TransformControls[]> = new Map();

export interface TransformControlProps {
  presentation: slye.Presentation;
  object?: THREE.Object3D;
  disabled?: boolean;
}

export class TransformControl extends Component<TransformControlProps> {
  private transformControl: THREE.TransformControls;

  constructor(props: TransformControlProps) {
    super(props);

    if (!props.presentation)
      throw new Error("TransformControl: `presentation` prop is required.");

    const { id } = props.presentation;
    if (!transformControls.has(id)) transformControls.set(id, []);
  }

  componentWillReceiveProps(nextProps: TransformControlProps) {
    if (nextProps.presentation !== this.props.presentation)
      throw new Error("TransformControl: `presentation` can not be changed.");
  }

  componentWillMount() {
    const { presentation } = this.props;
    const stack = transformControls.get(presentation.id);

    if (stack.length) {
      this.transformControl = stack.pop();
    } else {
      console.info("TransformControl: New Instance.");
      this.transformControl = new THREE.TransformControls(
        presentation.camera,
        presentation.domElement
      );
    }

    presentation.scene.add(this.transformControl);
    document.addEventListener("keypress", this.onKeypress);
  }

  componentWillUnmount() {
    this.transformControl.detach();
    this.props.presentation.scene.remove(this.transformControl);
    this.transformControl.enabled = false;
    document.removeEventListener("keypress", this.onKeypress);
    const stack = transformControls.get(this.props.presentation.id);
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
      this.transformControl.mode = mode as any;
      event.preventDefault();
    }
  };

  render() {
    if (this.props.object) this.transformControl.attach(this.props.object);
    this.transformControl.enabled = !!this.props.object && !this.props.disabled;

    return <div />;
  }
}
