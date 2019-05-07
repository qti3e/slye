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
          <BottomNavigationAction icon={<LocalIcon />} />
          <BottomNavigationAction icon={<PlayIcon />} />
        </BottomNavigation>

        <Thumbnails
          presentation={presentation}
          onSelect={this.handleSelect}
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
