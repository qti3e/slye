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

const mapControls: WeakMap<
  slye.Presentation,
  THREE.MapControls[]
> = new WeakMap();

export interface MapControlProps {
  presentation: slye.Presentation;
  disabled?: boolean;
}

export class MapControl extends Component<MapControlProps> {
  private mapControl: THREE.MapControls;

  constructor(props: MapControlProps) {
    super(props);

    if (!props.presentation)
      throw new Error("MapControl: `presentation` prop is required.");

    if (!mapControls.has(props.presentation))
      mapControls.set(props.presentation, []);
  }

  componentWillReceiveProps(nextProps: MapControlProps) {
    if (nextProps.presentation !== this.props.presentation)
      throw new Error("MapControl: `presentation` can not be changed.");
  }

  componentWillMount() {
    const { presentation } = this.props;
    const stack = mapControls.get(presentation);

    if (stack.length) {
      this.mapControl = stack.pop();
    } else {
      console.info("MapControl: New Instance.");
      const controls = new THREE.MapControls(
        this.props.presentation.camera,
        this.props.presentation.domElement
      );

      controls.enableDamping = false;
      controls.dampingFactor = 0.25;
      controls.screenSpacePanning = false;
      controls.minDistance = 100;
      controls.maxDistance = 500;
      controls.maxPolarAngle = Math.PI / 2;
      this.mapControl = controls;
    }

    this.mapControl.reset();
  }

  componentWillUnmount() {
    this.mapControl.enabled = false;
    const stack = mapControls.get(this.props.presentation);
    stack.push(this.mapControl);
    this.mapControl.saveState();
  }

  render(): null {
    this.mapControl.enabled = !this.props.disabled;
    return null;
  }
}
