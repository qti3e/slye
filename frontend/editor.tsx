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
  renderer: slye.Renderer;
  requestPlay: () => void;
}

interface EditorState {
  selectedStep: slye.ThreeStep;
  mode: EditorMode;
}

export class Editor extends Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);

    this.state = {
      selectedStep: props.renderer.getCurrentStep(),
      mode: EditorMode.WORLD
    };
  }

  componentWillReceiveProps(nextProps: EditorProps) {
    if (nextProps.renderer !== this.props.renderer)
      throw new Error("Editor: `renderer` can not be changed.");
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

    // Ctrl+Z: Undo
    if (ctrlKey && keyCode === 90) {
      this.props.renderer.actions.undo();
      event.preventDefault();
      return;
    }

    // Ctrl+Y: Redo
    if (ctrlKey && keyCode === 89) {
      this.props.renderer.actions.redo();
      event.preventDefault();
      return;
    }

    // Ctrl+S: Save
    if (ctrlKey && keyCode === 83) {
      client.save(this.props.renderer.presentation.uuid);
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

  handleSelect = (step: slye.ThreeStep): void => {
    this.setState({ selectedStep: step });
  };

  handleAdd = async (): Promise<void> => {
    const { renderer } = this.props;
    const { selectedStep } = this.state;
    const step = new slye.ThreeStep(uuidv1());
    if (selectedStep) {
      const { x, y, z } = selectedStep.getPosition();
      step.setPosition(x + 5 * 19.2 + 5, y, z);
    }
    const component = await slye.component("slye", "text", {
      size: 10,
      font: await slye.font("slye", "Homa"),
      text: "Write..."
    });
    step.add(component);

    renderer.actions.insertStep(step);
    this.setState({ selectedStep: step });
  };

  render() {
    const { selectedStep, mode } = this.state;
    const { renderer } = this.props;

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
          renderer={renderer}
          onSelect={this.handleSelect}
          onAdd={this.handleAdd}
          selected={selectedStep}
        />

        {mode === EditorMode.WORLD ? (
          <WorldEditor
            renderer={renderer}
            onSelect={this.handleSelect}
            editStep={(selectedStep: slye.ThreeStep) =>
              this.setState({
                selectedStep,
                mode: EditorMode.STEP
              })
            }
          />
        ) : (
          <StepEditor
            renderer={renderer}
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
