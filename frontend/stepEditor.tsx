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

import { ComponentUI } from "./componentUI";
import { TransformControl } from "./transformControl";
import { OrbitControl } from "./orbitControl";

export interface StepEditorProps {
  presentation: slye.Presentation;
  step: slye.Step;
  exit: () => void;
}

interface StepEditorState {
  isAltDown: boolean;
  selectedComponent: slye.Component;
  transform: boolean;
  edit: boolean;
  x: number;
  y: number;
}

export class StepEditor extends Component<StepEditorProps, StepEditorState> {
  state: StepEditorState = {
    isAltDown: false,
    selectedComponent: undefined,
    transform: false,
    edit: false,
    x: 0,
    y: 0
  };

  private hoverdComponent: slye.Component;

  componentWillMount() {
    this.props.presentation.focus();
    const id = this.props.presentation.getStepId(this.props.step);
    this.props.presentation.goTo(id, 60);
    // Events.
    const { domElement } = this.props.presentation;
    domElement.addEventListener("mousemove", this.onMouseMove);
    domElement.addEventListener("click", this.onClick);
    domElement.addEventListener("dblclick", this.onDblClick);
    document.addEventListener("keydown", this.onKeydown);
    document.addEventListener("keyup", this.onKeyup);
  }

  componentWillUnmount() {
    this.props.presentation.blur();
    const { domElement } = this.props.presentation;
    domElement.style.cursor = "auto";
    domElement.removeEventListener("mousemove", this.onMouseMove);
    domElement.removeEventListener("click", this.onClick);
    domElement.removeEventListener("dblclick", this.onDblClick);
    document.removeEventListener("keydown", this.onKeydown);
    document.removeEventListener("keyup", this.onKeyup);
  }

  onMouseMove = (event: MouseEvent): void => {
    const { presentation } = this.props;
    const { domElement } = presentation;
    this.hoverdComponent = presentation.raycastComponent();
    domElement.style.cursor = this.hoverdComponent ? "pointer" : "auto";
  };

  onKeydown = (event: KeyboardEvent): void => {
    const { keyCode } = event;

    // Alt
    if (keyCode === 18) {
      this.setState({ isAltDown: true });
      event.preventDefault();
      return;
    }
  };

  onKeyup = (event: KeyboardEvent): void => {
    const { keyCode } = event;

    // Alt
    if (keyCode === 18) {
      this.setState({ isAltDown: false });
      event.preventDefault();
      return;
    }

    // Escape
    if (event.keyCode === 27) {
      if (this.state.transform) {
        this.setState({ transform: false });
      } else if (this.state.edit) {
        this.setState({ edit: false });
      } else {
        this.props.exit();
      }
      event.preventDefault();
      return;
    }
  };

  onClick = (event: MouseEvent): void => {
    const { transform, selectedComponent } = this.state;
    if (transform && this.hoverdComponent === selectedComponent) return;
    if (transform && !this.hoverdComponent) return;

    this.props.presentation.domElement.style.cursor = "auto";
    this.setState({
      selectedComponent: this.hoverdComponent,
      transform: !!this.hoverdComponent,
      edit: false
    });
  };

  onDblClick = (event: MouseEvent): void => {
    if (!this.hoverdComponent) return;

    this.setState({
      selectedComponent: this.hoverdComponent,
      edit: true,
      transform: false,
      x: event.offsetX,
      y: event.offsetY
    });
  };

  render() {
    const { presentation, step } = this.props;
    const { isAltDown, edit, x, y, selectedComponent, transform } = this.state;

    if (edit) {
      return <ComponentUI component={selectedComponent} x={x} y={y} />;
    }

    return (
      <Fragment>
        {transform && (
          <TransformControl
            presentation={presentation}
            object={selectedComponent && selectedComponent.group}
            disabled={isAltDown}
          />
        )}
        {isAltDown || !transform ? (
          <OrbitControl presentation={presentation} center={step.group} />
        ) : null}
      </Fragment>
    );
  }
}
