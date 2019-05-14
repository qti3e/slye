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

const orbitControls: WeakMap<
  slye.Renderer,
  THREE.OrbitControls[]
> = new WeakMap();

export interface OrbitControlProps {
  renderer: slye.Renderer;
  center: THREE.Object3D;
  disabled?: boolean;
}

export class OrbitControl extends Component<OrbitControlProps> {
  private orbitControl: THREE.OrbitControls;

  constructor(props: OrbitControlProps) {
    super(props);

    if (!props.renderer)
      throw new Error("OrbitControl: `renderer` prop is required.");

    if (!orbitControls.has(props.renderer))
      orbitControls.set(props.renderer, []);
  }

  componentWillReceiveProps(nextProps: OrbitControlProps) {
    if (nextProps.renderer !== this.props.renderer)
      throw new Error("OrbitControl: `renderer` can not be changed.");
  }

  componentWillMount() {
    const { renderer } = this.props;
    const stack = orbitControls.get(renderer);

    if (stack.length) {
      this.orbitControl = stack.pop();
    } else {
      console.info("OrbitControl: New Instance.");
      this.orbitControl = new THREE.OrbitControls(
        this.props.renderer.camera,
        this.props.renderer.domElement
      );
    }
  }

  componentWillUnmount() {
    this.orbitControl.enabled = false;
    const stack = orbitControls.get(this.props.renderer);
    stack.push(this.orbitControl);
  }

  render(): null {
    this.orbitControl.enabled = !this.props.disabled && !!this.props.center;
    this.orbitControl.target.copy(this.props.center.position);
    return null;
  }
}
