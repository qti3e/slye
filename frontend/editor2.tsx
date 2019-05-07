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
          />
        ) : (
          <StepEditor
            presentation={presentation}
            step={selectedStep}
            back={() => this.setState({ mode: EditorMode.WORLD })}
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
