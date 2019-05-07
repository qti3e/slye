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

export interface OrbitControlProps {
  presentation: slye.Presentation;
  disabled?: boolean;
}

export class OrbitControl extends Component<OrbitControlProps> {
  private orbitControl: THREE.OrbitControls;

  constructor(props: OrbitControlProps) {
    super(props);

    if (!props.presentation)
      throw new Error("OrbitControl: `presentation` prop is required.");

    this.orbitControl = new THREE.OrbitControls(
      props.presentation.camera,
      props.presentation.domElement
    );

    console.info("OrbitControl: New Instance.");
  }

  componentWillReceiveProps(nextProps: OrbitControlProps) {
    if (nextProps.presentation !== this.props.presentation)
      throw new Error("OrbitControl: `presentation` can not be changed.");
  }

  componentWillUnmount() {
    this.orbitControl.enabled = false;
  }

  render(): null {
    this.orbitControl.enabled = !this.props.disabled;
    return null;
  }
}
