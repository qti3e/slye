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
import uuidv1 from "uuid/v1";
import * as slye from "@slye/core";

import { WorldEditor } from "./worldEditor";
import { StepEditor } from "./stepEditor";
import { Thumbnails } from "./thumbnail";

// Material-UI component.
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";

// Icons.
import WorldIcon from "@material-ui/icons/ThreeSixtySharp";
import LocalIcon from "@material-ui/icons/FormatListNumberedSharp";
import PlayIcon from "@material-ui/icons/PlayArrowSharp";

enum EditorMode {
  WORLD,
  STEP
}

export interface EditorProps {
  presentation: slye.Presentation;
  requestPlay: () => void;
}

interface EditorState {
  selectedStep: slye.Step;
  mode: EditorMode;
}

export class Editor extends Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);

    this.state = {
      selectedStep: props.presentation.getCurrentStep(),
      mode: EditorMode.WORLD
    };
  }

  componentWillReceiveProps(nextProps: EditorProps) {
    if (nextProps.presentation !== this.props.presentation)
      throw new Error("Editor: `presentation` can not be changed.");
  }

  componentWillMount() {
    document.addEventListener("keyup", this.onKeyup);
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.onKeyup);
  }

  onKeyup = (event: KeyboardEvent): void => {
    const { keyCode, ctrlKey } = event;

    // F5
    if (keyCode === 116) {
      this.props.requestPlay();
      event.preventDefault();
      return;
    }

    // Ctrl+F should focus on the step.
    if (ctrlKey && keyCode === 70) {
      const id = this.props.presentation.getStepId(this.state.selectedStep);
      this.props.presentation.goTo(id, 60);
      event.preventDefault();
      return;
    }

    // Ctrl+N & Ctrl+[Right Arrow]: Go to the next step.
    if (ctrlKey && (keyCode === 78 || keyCode === 39)) {
      this.props.presentation.next();
      event.preventDefault();
      return;
    }

    // Ctrl+P & Ctrl+[Left Arrow]: Go to the previous step.
    if (ctrlKey && (keyCode === 80 || keyCode === 37)) {
      this.props.presentation.prev();
      event.preventDefault();
      return;
    }

    // Ctrl+Z: Undo
    if (ctrlKey && keyCode === 90) {
      this.props.presentation.actions.undo();
      event.preventDefault();
      return;
    }

    // Ctrl+Y: Redo
    if (ctrlKey && keyCode === 89) {
      this.props.presentation.actions.redo();
      event.preventDefault();
      return;
    }

    // Ctrl+S: Save
    if (ctrlKey && keyCode === 83) {
      client.save(this.props.presentation.uuid);
      event.preventDefault();
      return;
    }
  };

  handleNavClick = (event: object, value: number): void => {
    switch (value) {
      case 0:
        this.setState({ mode: EditorMode.WORLD });
        break;
      case 1:
        this.setState({ mode: EditorMode.STEP });
        break;
      case 2:
        this.props.requestPlay();
        break;
    }
  };

  handleSelect = (step: slye.Step): void => {
    this.setState({ selectedStep: step });
  };

  handleAdd = async (): Promise<void> => {
    const { presentation } = this.props;
    const { selectedStep } = this.state;
    const step = new slye.Step(uuidv1());
    if (selectedStep) {
      const { x, y, z } = selectedStep.getPosition();
      step.setPosition(x + 30, y, z);
    }
    const component = await slye.component("slye", "text", {
      size: 10,
      font: await slye.font("slye", "Homa"),
      text: "Write..."
    });
    step.add(component);

    presentation.actions.insertStep(step, presentation);
    const id = this.props.presentation.getStepId(step);
    presentation.goTo(id, 60);
    this.setState({ selectedStep: step });
  };

  render() {
    const { selectedStep, mode } = this.state;
    const { presentation } = this.props;

    return (
      <Fragment>
        <BottomNavigation
          style={styles.navigationButtoms}
          value={mode}
          onChange={this.handleNavClick}
        >
          <BottomNavigationAction icon={<WorldIcon />} />
          <BottomNavigationAction
            disabled={!selectedStep}
            icon={<LocalIcon />}
          />
          <BottomNavigationAction icon={<PlayIcon />} />
        </BottomNavigation>

        <Thumbnails
          presentation={presentation}
          onSelect={this.handleSelect}
          onAdd={this.handleAdd}
          selected={selectedStep}
        />

        {mode === EditorMode.WORLD ? (
          <WorldEditor
            presentation={presentation}
            onSelect={this.handleSelect}
            editStep={(selectedStep: slye.Step) =>
              this.setState({
                selectedStep,
                mode: EditorMode.STEP
              })
            }
          />
        ) : (
          <StepEditor
            presentation={presentation}
            step={selectedStep}
            exit={() => this.setState({ mode: EditorMode.WORLD })}
          />
        )}
      </Fragment>
    );
  }
}

const styles: Record<string, React.CSSProperties> = {
  navigationButtoms: {
    position: "fixed",
    top: 32,
    width: 300,
    left: "calc(50% - 150px)",
    borderRadius: "0 0 40px 40px"
  }
};
