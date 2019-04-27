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
import { sly, Presentation } from "@slye/core";
import { sleep } from "./util";

import Collapse from "@material-ui/core/Collapse";
import Paper from "@material-ui/core/Paper";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";

// Icons
import ThreeDRoationIcon from "@material-ui/icons/ThreeDRotation";
import StorylineIcon from "@material-ui/icons/FormatListNumbered";
import PlayIcon from "@material-ui/icons/PlayArrow";

export interface EditorProps {
  presentationDescriptor: string;
}

interface EditorState {
  value: number;
}

export class Editor extends Component<EditorProps, EditorState> {
  state = { value: 0 };

  /**
   * A table that holds all of the open presentations.
   */
  static presentations: Map<string, Presentation> = new Map();

  /**
   * Current presentation.
   */
  presentation: Presentation;

  /**
   * Div element that wraps the canvas.
   */
  canvasWrapper: Element;

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

    window.addEventListener("resize", () => {
      this.presentation.resize(w(), h());
    }, false);

    this.canvasWrapper = (
      <div
        style={{ position: "fixed", top: 32, left: 0, zIndex: -5 }}
        ref={this.handleCanvasWrapper} />
    ) as any;

    // Set it into the Map.
    Editor.presentations.set(presentationDescriptor, this.presentation);

    // Construct the presentation.
    const slyRes = await client.fetchSly(presentationDescriptor);
    await sly(this.presentation, slyRes.presentation);
    await sleep(500);
    this.presentation.goTo(0, 0);

    // Render the presentation.
    const render = () => {
      this.presentation.render();
      window.requestAnimationFrame(render);
    };
    window.requestAnimationFrame(render);
  }

  handleChange = (event: any, value: number) => {
    this.setState({ value });
  };

  render() {
    const { value } = this.state;

    return (
      <Fragment>
        { this.canvasWrapper }
        <BottomNavigation
          style={{
            position: "fixed",
            top: 32,
            width: 300,
            left: "calc(50% - 150px)",
            borderRadius: "0 0 40px 40px"
          }}
          value={value}
          onChange={this.handleChange}
        >
          <BottomNavigationAction icon={<ThreeDRoationIcon />} />
          <BottomNavigationAction icon={<StorylineIcon />} />
          <BottomNavigationAction icon={<PlayIcon />} />
        </BottomNavigation>

        <Collapse in={value === 1}>
          <Paper style={paperStyle}>
            X
          </Paper>
        </Collapse>

      </Fragment>
    );
  }
}

const paperStyle: React.CSSProperties = {
  height: "calc(100vh - 56px - 65px - 2 * 15px)",
  width: "calc(100vw - 70px - 2 * 15px)",
  position: "relative",
  top: 47,
  left: 35,
  opacity: 0.9,
  borderRadius: 15,
  padding: 15
};
