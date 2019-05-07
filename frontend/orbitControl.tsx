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

const orbitControls: Map<string, THREE.OrbitControls[]> = new Map();

export interface OrbitControlProps {
  presentation: slye.Presentation;
  center: THREE.Object3D;
  disabled?: boolean;
}

export class OrbitControl extends Component<OrbitControlProps> {
  private orbitControl: THREE.OrbitControls;

  constructor(props: OrbitControlProps) {
    super(props);

    if (!props.presentation)
      throw new Error("OrbitControl: `presentation` prop is required.");

    const { id } = props.presentation;
    if (!orbitControls.has(id)) orbitControls.set(id, []);
  }

  componentWillReceiveProps(nextProps: OrbitControlProps) {
    if (nextProps.presentation !== this.props.presentation)
      throw new Error("OrbitControl: `presentation` can not be changed.");
  }

  componentWillMount() {
    const { presentation } = this.props;
    const stack = orbitControls.get(presentation.id);

    if (stack.length) {
      this.orbitControl = stack.pop();
    } else {
      console.info("OrbitControl: New Instance.");
      this.orbitControl = new THREE.OrbitControls(
        this.props.presentation.camera,
        this.props.presentation.domElement
      );
    }
  }

  componentWillUnmount() {
    this.orbitControl.enabled = false;
    const stack = orbitControls.get(this.props.presentation.id);
    stack.push(this.orbitControl);
  }

  render(): null {
    this.orbitControl.enabled = !this.props.disabled && !!this.props.center;
    this.orbitControl.target.copy(this.props.center.position);
    return null;
  }
}
