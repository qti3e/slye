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

    this.transformControl = new THREE.TransformControls(
      props.presentation.camera,
      props.presentation.domElement
    );

    console.info("TransformControl: New Instance.");
  }

  componentWillReceiveProps(nextProps: TransformControlProps) {
    if (nextProps.presentation !== this.props.presentation)
      throw new Error("TransformControl: `presentation` can not be changed.");
  }

  componentWillMount() {
    this.props.presentation.scene.add(this.transformControl);
  }

  componentWillUnmount() {
    this.transformControl.detach();
    this.props.presentation.scene.remove(this.transformControl);
    this.transformControl.enabled = false;
    // When should we call dispose?
  }

  render() {
    if (this.props.object) this.transformControl.attach(this.props.object);
    this.transformControl.enabled = !!this.props.object && !this.props.disabled;

    return <div />;
  }
}
