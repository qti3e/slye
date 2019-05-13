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

const mapControls: WeakMap<slye.Renderer, THREE.MapControls[]> = new WeakMap();

export interface MapControlProps {
  renderer: slye.Renderer;
  disabled?: boolean;
}

export class MapControl extends Component<MapControlProps> {
  private mapControl: THREE.MapControls;

  constructor(props: MapControlProps) {
    super(props);

    if (!props.renderer)
      throw new Error("MapControl: `renderer` prop is required.");

    if (!mapControls.has(props.renderer)) mapControls.set(props.renderer, []);
  }

  componentWillReceiveProps(nextProps: MapControlProps) {
    if (nextProps.renderer !== this.props.renderer)
      throw new Error("MapControl: `renderer` can not be changed.");
  }

  componentWillMount() {
    const { renderer } = this.props;
    const stack = mapControls.get(renderer);

    if (stack.length) {
      this.mapControl = stack.pop();
    } else {
      console.info("MapControl: New Instance.");
      const controls = new THREE.MapControls(
        this.props.renderer.camera,
        this.props.renderer.domElement
      );

      controls.enableDamping = false;
      controls.dampingFactor = 0.25;
      controls.screenSpacePanning = false;
      controls.minDistance = 100;
      controls.maxDistance = 500;
      controls.maxPolarAngle = Math.PI / 2;
      this.mapControl = controls;
    }
  }

  componentWillUnmount() {
    const stack = mapControls.get(this.props.renderer);
    stack.push(this.mapControl);
  }

  render(): null {
    this.mapControl.enabled = !this.props.disabled;
    return null;
  }
}
