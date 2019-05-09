/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import React, { Component, Fragment } from "react";
import * as THREE from "three";
import * as slye from "@slye/core";

import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/AddCircleSharp";

import "./thumbnail.scss";

const WIDTH = 106.6;
const HEIGHT = 60;

interface PresentationData {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
}

export interface ThumbnailsProps {
  presentation: slye.Presentation;
  selected: slye.Step;
  onSelect: (step: slye.Step) => void;
}

export class Thumbnails extends Component<ThumbnailsProps> {
  static readonly data = new WeakMap<slye.Presentation, PresentationData>();

  private mounted: boolean;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;

  constructor(props: ThumbnailsProps) {
    super(props);

    if (!Thumbnails.data.has(props.presentation)) {
      const renderer = new THREE.WebGLRenderer({ alpha: true });
      const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 250);
      renderer.setSize(600, HEIGHT);
      Thumbnails.data.set(props.presentation, { renderer, camera });
    }

    const { renderer, camera } = Thumbnails.data.get(props.presentation);
    this.renderer = renderer;
    this.camera = camera;
  }

  componentWillMount() {
    this.mounted = true;
    requestAnimationFrame(this.webGLRender);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  webGLRender = () => {
    const { steps, scene } = this.props.presentation;
    const { renderer, camera } = this;

    renderer.setClearColor(0, 0);
    renderer.setScissorTest(false);
    renderer.clear();

    renderer.setClearColor(0x000, 0);
    renderer.setScissorTest(true);

    const madeInvisible = [];

    for (const obj of scene.children) {
      if (obj.visible && obj instanceof THREE.TransformControls) {
        obj.visible = false;
        madeInvisible.push(obj);
      }
    }

    for (const step of steps) {
      if (step.group.visible) {
        step.group.visible = false;
        madeInvisible.push(step.group);
      }
    }

    for (let i = 0; i < steps.length; ++i) {
      const step = steps[i];
      step.group.visible = true;

      const { position, rotation } = slye.getCameraPosRotForStep(step, camera);
      camera.position.set(position.x, position.y, position.z);
      camera.rotation.set(rotation.x, rotation.y, rotation.z);

      renderer.setViewport(5 + WIDTH * i + 7.5 + i * 15, 0, WIDTH, HEIGHT);
      renderer.setScissor(5 + WIDTH * i + 7.5 + i * 15, 0, WIDTH, HEIGHT);

      renderer.render(scene, camera);

      step.group.visible = false;
    }

    for (const obj of madeInvisible) {
      obj.visible = true;
    }

    if (this.mounted) requestAnimationFrame(this.webGLRender);
  };

  render() {
    const { presentation, onSelect, selected } = this.props;

    return (
      <Paper className="thumbnails-container" elevation={1}>
        <div ref={div => div && div.appendChild(this.renderer.domElement)} />
        <div className="thumbnails-list">
          {presentation.steps.map((step, id) => (
            <div className="thumbnail" onClick={() => onSelect(step)}>
              <span>{id + 1}</span>
            </div>
          ))}
          <IconButton aria-label="New" className="add-btn">
            <AddIcon fontSize="large" />
          </IconButton>
        </div>
      </Paper>
    );
  }
}
