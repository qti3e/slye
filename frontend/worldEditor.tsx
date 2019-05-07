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

export interface WorldEditorProps {
  presentation: slye.Presentation;
  onSelect: (step: slye.Step) => void;
  editStep: (step: slye.Step) => void;
}

interface WorldEditorState {
  focusedStep: slye.Step;
}

export class WorldEditor extends Component<WorldEditorProps, WorldEditorState> {
  state: WorldEditorState = {
    focusedStep: undefined
  };

  private hoverdStep: slye.Step;

  componentWillReceiveProps(nextProps: WorldEditorProps) {
    if (nextProps.presentation !== this.props.presentation)
      throw new Error("WorldEditor: `presentation` can not be changed.");
  }

  componentWillMount() {
    const { domElement } = this.props.presentation;
    domElement.addEventListener("mousemove", this.onMouseMove);
    domElement.addEventListener("click", this.onClick);
    domElement.addEventListener("dblclick", this.onDblClick);
    document.addEventListener("keyup", this.onKeyup);
  }

  componentWillUnmount() {
    const { domElement } = this.props.presentation;
    domElement.removeEventListener("mousemove", this.onMouseMove);
    domElement.removeEventListener("click", this.onClick);
    domElement.removeEventListener("dblclick", this.onDblClick);
    document.removeEventListener("keyup", this.onKeyup);
  }

  onMouseMove = (event: MouseEvent): void => {
    const { presentation } = this.props;
    this.hoverdStep = presentation.raycastStep();
    presentation.domElement.style.cursor = this.hoverdStep ? "pointer" : "auto";
  };

  onClick = (event: MouseEvent): void => {
    if (this.state.focusedStep) return;
    this.setState({ focusedStep: this.hoverdStep });
    this.props.presentation.domElement.style.cursor = "auto";
    if (this.hoverdStep) this.props.onSelect(this.hoverdStep);
  };

  onDblClick = (event: MouseEvent): void => {
    if (this.hoverdStep) this.props.editStep(this.hoverdStep);
  };

  onKeyup = (event: KeyboardEvent): void => {
    // Escape.
    if (this.state.focusedStep && event.keyCode === 27) {
      this.setState({ focusedStep: undefined });
    }
  };

  render() {
    const { presentation } = this.props;
    const { focusedStep } = this.state;

    return (
      <Fragment>
        {focusedStep && (
          <TransformControl
            presentation={presentation}
            object={focusedStep.group}
          />
        )}
      </Fragment>
    );
  }
}
