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
import Scrollbars, { positionValues } from "react-custom-scrollbars";
import * as THREE from "three";
import * as slye from "@slye/core";

import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/AddBoxRounded";

import "./thumbnail.scss";

const WIDTH = 105;
const HEIGHT = 60;

interface PresentationData {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
}

export interface ThumbnailsProps {
  presentation: slye.Presentation;
  selected: slye.Step;
  onSelect(step: slye.Step): void;
  onAdd(): void;
}

interface ThumbnailsState {
  open: boolean;
}

export class Thumbnails extends Component<ThumbnailsProps, ThumbnailsState> {
  static readonly data = new WeakMap<slye.Presentation, PresentationData>();

  state = {
    open: false
  };

  private scrollLeft: number = 0;
  private mounted: boolean;
  private hovered: boolean;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private timer: number;
  private lastTimerStart: number;

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
    this.webGLRender(true);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  webGLRender = (forced?: boolean) => {
    if (!forced) {
      if (!this.mounted) return;
      if (!this.hovered && !this.state.open) return;
    }

    const { steps, scene } = this.props.presentation;
    const { renderer, camera } = this;

    renderer.setClearColor(0, 0);
    renderer.setScissorTest(false);
    renderer.clear();

    renderer.setClearColor(0xffffff);
    renderer.setScissorTest(true);

    const madeInvisible = [];

    for (const obj of scene.children) {
      if (
        obj.visible &&
        (obj instanceof THREE.TransformControls || obj.userData.step)
      ) {
        obj.visible = false;
        madeInvisible.push(obj);
      }
    }

    // 5px: Margin of the list. (In CSS file)
    // 7px: Margin-left of  the first thumbnail.
    let left = 5 - this.scrollLeft + 7;
    // Each thumbnail takes (WIDTH + 14)px of space. (15px is for the margin)
    // and we're simply computing the step at the beginning of the list.
    let i = Math.floor(this.scrollLeft / (WIDTH + 14));
    // 600px is width of the list defined in the CSS file.
    const end = Math.min(i + Math.ceil(600 / (WIDTH + 14)) + 2, steps.length);

    for (; i < end; ++i) {
      const step = steps[i];
      step.group.visible = true;

      const { position, rotation } = slye.getCameraPosRotForStep(step, camera);
      camera.position.set(position.x, position.y, position.z);
      camera.rotation.set(rotation.x, rotation.y, rotation.z);

      renderer.setViewport(left + i * (WIDTH + 14), 0, WIDTH, HEIGHT);
      renderer.setScissor(left + i * (WIDTH + 14), 0, WIDTH, HEIGHT);

      renderer.render(scene, camera);

      step.group.visible = false;
    }

    madeInvisible.map(obj => (obj.visible = true));

    const time = Date.now();
    if (time - this.lastTimerStart >= 1900 || !this.lastTimerStart) {
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(this.webGLRender, 2000);
      this.lastTimerStart = time;
    }
  };

  onScrollFrame = (value: positionValues) => {
    this.scrollLeft = value.scrollLeft;
    this.webGLRender();
  };

  handleToggle = (): void => {
    this.setState(state => ({
      open: !state.open
    }));
  };

  handleAdd = () => {
    this.props.onAdd();
  };

  render() {
    const { presentation, onSelect, selected } = this.props;
    const { open } = this.state;
    const style = {
      bottom: open ? 24 : undefined
    };
    this.webGLRender(true);

    return (
      <Paper
        className="thumbnails-container"
        style={style}
        elevation={1}
        onMouseEnter={() => ((this.hovered = true), this.webGLRender(true))}
        onMouseLeave={() => (this.hovered = false)}
      >
        <Tooltip title="Click To Toggle Preview" placement="top">
          <div className="toggle" onClick={this.handleToggle} />
        </Tooltip>
        <div ref={div => div && div.appendChild(this.renderer.domElement)} />
        <Scrollbars
          className="thumbnails-list"
          onScrollFrame={this.onScrollFrame}
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}
          thumbMinSize={30}
        >
          {presentation.steps.map((step, id) => (
            <div
              key={`t${id}`}
              className="thumbnail"
              onClick={() => onSelect(step)}
            >
              <span>{id + 1}</span>
            </div>
          ))}
          <IconButton
            aria-label="New Step"
            className="add-btn"
            onClick={this.handleAdd}
          >
            <AddIcon fontSize="large" />
          </IconButton>
        </Scrollbars>
      </Paper>
    );
  }
}
