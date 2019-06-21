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

      // Maybe we can use less magic here?
      this.props.renderer.camera.rotation.set(
        -1.665337208354138e-16,
        -1.1942754044593986,
        -1.5486794606577854e-16
      );
      controls.zoom0 = 1;
      controls.position0.set(
        -306.6180783491735,
        1.9681294204195255e-14,
        188.24827612525496
      );
      controls.target0.set(
        -33.55458497635768,
        1.701482260977322e-15,
        80.28328349179617
      );
      controls.reset();
    }
  }

  componentWillUnmount() {
    this.mapControl.enabled = false;
    const stack = mapControls.get(this.props.renderer);
    stack.push(this.mapControl);
  }

  render(): null {
    this.mapControl.enabled = !this.props.disabled;
    return null;
  }
}
