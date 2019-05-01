/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import * as THREE from "three";
import React, { Component, Fragment } from "react";
import {
  sly,
  Presentation,
  Step,
  Component as SlyeComponent
} from "@slye/core";
import { sleep } from "./util";

// Material-UI component.
import Collapse from "@material-ui/core/Collapse";
import Paper from "@material-ui/core/Paper";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import Fab from "@material-ui/core/Fab";

// Icons.
import WorldIcon from "@material-ui/icons/ThreeSixtySharp";
import StorylineIcon from "@material-ui/icons/FormatListNumberedSharp";
import PlayIcon from "@material-ui/icons/PlayArrowSharp";
import { MoveIcon, RotateIcon, ScaleIcon } from "./icons";

export interface EditorProps {
  presentationDescriptor: string;
}

enum EditorMode {
  WORLD,
  LOCAL,
  PLAY
}

interface EditorState {
  mode: EditorMode;
}

export class Editor extends Component<EditorProps, EditorState> {
  state = {
    mode: EditorMode.WORLD
  };

  /**
   * A table that holds all of the open presentations.
   */
  static presentations: Map<string, Presentation> = new Map();

  /**
   * Current presentation.
   */
  private presentation: Presentation;

  /**
   * Div element that wraps the canvas.
   */
  private canvasWrapper: Element;

  /**
   * The step that users mouse in currently pointing to.
   */
  private intersectedStep: Step;
  private intersectedComponent: SlyeComponent;

  private transformControl: THREE.TransformControls;
  private orbitControl: THREE.OrbitControls;

  componentWillMount() {
    this.open();
  }

  /**
   * Called when the canvas wrapper element is in the DOM.
   */
  handleCanvasWrapper = (e: HTMLDivElement): void => {
    e.appendChild(this.presentation.domElement);
  };

  /**
   * Open the current presentation.
   */
  async open(): Promise<void> {
    const { presentationDescriptor } = this.props;

    if (Editor.presentations.has(presentationDescriptor)) {
      this.presentation = Editor.presentations.get(presentationDescriptor);
      return;
    }

    const w = () => window.innerWidth;
    // status bar (bottom): 24px & top bar: 32px so decrement by 56.
    const h = () => window.innerHeight - 56;

    this.presentation = new Presentation(presentationDescriptor, w(), h());

    this.transformControl = new THREE.TransformControls(
      this.presentation.camera,
      this.presentation.domElement
    );

    this.orbitControl = new THREE.OrbitControls(
      this.presentation.camera,
      this.presentation.domElement
    );

    this.transformControl.enabled = false;
    this.orbitControl.enabled = false;

    this.presentation.scene.add(this.transformControl);

    window.addEventListener(
      "resize",
      () => {
        this.presentation.resize(w(), h());
      },
      false
    );

    this.canvasWrapper = (
      <div
        style={{ position: "fixed", top: 32, left: 0, zIndex: -5 }}
        ref={this.handleCanvasWrapper}
      />
    ) as any;

    // Set it into the Map.
    Editor.presentations.set(presentationDescriptor, this.presentation);

    // Construct the presentation.
    const slyRes = await client.fetchSly(presentationDescriptor);
    await sly(this.presentation, slyRes.presentation);
    await sleep(500);
    this.presentation.goTo(0, 0);
    this.presentation.use(this.onAnimationFrame);

    // Render the presentation.
    const render = () => {
      this.presentation.render();
      window.requestAnimationFrame(render);
    };
    window.requestAnimationFrame(render);

    (window as any).p = this.presentation;

    // Events.
    const dom = this.presentation.domElement;
    dom.addEventListener("mousemove", this.onMouseMove);
    dom.addEventListener("click", this.onClick);
    dom.addEventListener("dblclick", this.onDblClick);
  }

  handleChange = (event: any, mode: number) => {
    if (mode === EditorMode.LOCAL || mode == EditorMode.WORLD) {
      this.setState({
        mode
      });
    }
  };

  onMouseMove = (event: MouseEvent): void => {
    if (this.transformControl.enabled) return;

    const { width, height } = this.presentation.domElement;
    const x = event.offsetX;
    const y = event.offsetY - 32;
    const webglX = (x / width) * 2 - 1;
    const webglY = -(y / height) * 2 + 1;
    let intersected = false;

    this.presentation.updateMouse(webglX, webglY);

    if (this.state.mode === EditorMode.WORLD) {
      this.intersectedStep = this.presentation.raycastStep();
      intersected = !!this.intersectedStep;
    }

    if (this.state.mode === EditorMode.LOCAL) {
      this.intersectedComponent = this.presentation.raycastComponent();
      intersected = !!this.intersectedComponent;
    }

    if (intersected) {
      this.presentation.domElement.style.cursor = "pointer";
    } else {
      this.presentation.domElement.style.cursor = "auto";
    }
  };

  onAnimationFrame = (frame: number): void => {};

  onClick = (event: MouseEvent): void => {
    switch (this.state.mode) {
      case EditorMode.WORLD:
        if (this.intersectedStep) {
          this.transformControl.attach(this.intersectedStep.group);
          this.transformControl.enabled = true;
          this.presentation.domElement.style.cursor = "auto";
        } else {
          this.transformControl.detach();
          this.transformControl.enabled = false;
        }
        break;
      case EditorMode.LOCAL:
        if (this.intersectedComponent) {
          this.transformControl.attach(this.intersectedComponent.group);
          this.transformControl.enabled = true;
          this.presentation.domElement.style.cursor = "auto";
        } else {
          this.transformControl.detach();
          this.transformControl.enabled = false;
        }
        break;
    }
  };

  onDblClick = (evnet: MouseEvent): void => {
    switch (this.state.mode) {
      case EditorMode.WORLD:
        if (this.intersectedStep) {
          this.transformControl.enabled = false;
          this.transformControl.detach();
          const id = this.presentation.getStepId(this.intersectedStep);
          this.presentation.goTo(id, 60);
          this.setState({ mode: EditorMode.LOCAL });
        }
        break;
    }
  };

  render() {
    const { mode } = this.state;

    return (
      <Fragment>
        {this.canvasWrapper}
        <BottomNavigation
          style={styles.buttonGroup}
          value={mode}
          onChange={this.handleChange}
        >
          <BottomNavigationAction icon={<WorldIcon />} />
          <BottomNavigationAction icon={<StorylineIcon />} />
          <BottomNavigationAction icon={<PlayIcon />} />
        </BottomNavigation>

        <div style={styles.transformControlButtons}>
          <Fab
            style={transformControlButton(0)}
            onClick={() => this.transformControl.setMode("translate")}
          >
            <MoveIcon />
          </Fab>
          <Fab
            style={transformControlButton(1)}
            onClick={() => this.transformControl.setMode("rotate")}
          >
            <RotateIcon />
          </Fab>
          <Fab
            style={transformControlButton(2)}
            onClick={() => this.transformControl.setMode("scale")}
          >
            <ScaleIcon />
          </Fab>
        </div>
      </Fragment>
    );
  }
}

const styles: Record<string, React.CSSProperties> = {
  paper: {
    height: "calc(100vh - 56px - 65px)",
    width: "calc(100vw - 70px)",
    position: "relative",
    top: 59,
    left: 35,
    borderRadius: 15,
    opacity: 0.9,
    background: "rgba(0, 0, 0, 0)"
  },
  buttonGroup: {
    position: "fixed",
    top: 32,
    width: 300,
    left: "calc(50% - 150px)",
    borderRadius: "0 0 40px 40px"
  },
  transformControlButtons: {
    width: 300,
    height: 300,
    borderRadius: 150,
    position: "fixed",
    top: "calc(50vh - 150px + 32px)",
    border: "2px solid",
    left: -205
  }
};

const transformControlButton = (i: number): React.CSSProperties => ({
  width: 65,
  height: 65,
  position: "absolute",
  left: [205, 260, 205][i],
  top: [0, 150 - 65 / 2 - 12, 235][i]
});
