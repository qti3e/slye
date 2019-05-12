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
import * as slye from "@slye/core";

import { TransformControl } from "./transformControl";
import { MapControl } from "./mapControl";

export interface WorldEditorProps {
  renderer: slye.Renderer;
  onSelect: (step: slye.ThreeStep) => void;
  editStep: (step: slye.ThreeStep) => void;
}

interface WorldEditorState {
  focusedStep: slye.ThreeStep;
  transform: boolean;
}

export class WorldEditor extends Component<WorldEditorProps, WorldEditorState> {
  state: WorldEditorState = {
    focusedStep: undefined,
    transform: false
  };

  private hoverdStep: slye.ThreeStep;

  componentWillReceiveProps(nextProps: WorldEditorProps) {
    if (nextProps.renderer !== this.props.renderer)
      throw new Error("WorldEditor: `renderer` can not be changed.");
  }

  async componentWillMount() {
    const { domElement } = this.props.renderer;
    await this.props.renderer.setState("map");
    domElement.addEventListener("mousemove", this.onMouseMove);
    domElement.addEventListener("click", this.onClick);
    domElement.addEventListener("dblclick", this.onDblClick);
    document.addEventListener("keyup", this.onKeyup);
  }

  componentWillUnmount() {
    const { domElement } = this.props.renderer;
    domElement.style.cursor = "auto";
    domElement.removeEventListener("mousemove", this.onMouseMove);
    domElement.removeEventListener("click", this.onClick);
    domElement.removeEventListener("dblclick", this.onDblClick);
    document.removeEventListener("keyup", this.onKeyup);
  }

  onMouseMove = (event: MouseEvent): void => {
    const { renderer } = this.props;
    this.hoverdStep = renderer.raycaster.raycastStep();
    renderer.domElement.style.cursor = this.hoverdStep ? "pointer" : "auto";
  };

  onClick = (event: MouseEvent): void => {
    if (this.state.focusedStep && !this.hoverdStep) return;
    if (this.state.focusedStep === this.hoverdStep) return;

    this.setState({ focusedStep: this.hoverdStep, transform: true });
    this.props.renderer.domElement.style.cursor = "auto";
    if (this.hoverdStep) this.props.onSelect(this.hoverdStep);
  };

  onDblClick = (event: MouseEvent): void => {
    if (this.hoverdStep) this.props.editStep(this.hoverdStep);
  };

  onKeyup = (event: KeyboardEvent): void => {
    const { keyCode } = event;

    // Escape.
    if (this.state.transform && keyCode === 27) {
      this.setState({ focusedStep: undefined, transform: false });
    }

    // Delete
    if (keyCode === 46) {
      const step = this.state.focusedStep;
      if (step) {
        this.props.renderer.actions.deleteStep(step);
        this.setState({ focusedStep: undefined });
        this.props.onSelect(undefined);
      }
    }
  };

  render() {
    const { renderer } = this.props;
    const { focusedStep, transform } = this.state;

    return (
      <Fragment>
        {transform && focusedStep ? (
          <TransformControl renderer={renderer} object={focusedStep.group} />
        ) : null}
        {!transform ? <MapControl renderer={renderer} /> : null}
      </Fragment>
    );
  }
}
