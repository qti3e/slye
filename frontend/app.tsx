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

import { Editor } from "./editor2";
import { Player } from "./player";
import { sleep } from "./util";

export interface AppProps {
  presentationDescriptor: string;
}

interface AppState {
  isPlaying: boolean;
  isLoading: boolean;
}

export class App extends Component<AppProps, AppState> {
  private readonly canvasContainer: React.ReactElement;
  private readonly presentation: slye.Presentation;

  constructor(props: AppProps) {
    super(props);

    this.canvasContainer = (
      <div style={styles.canvasContainer} ref={this.handleContainerRef} />
    );

    this.state = {
      isPlaying: false,
      isLoading: true
    };

    // status bar (bottom): 24px & top bar: 32px so decrement by 56.
    this.presentation = new slye.Presentation(
      props.presentationDescriptor,
      innerWidth,
      innerHeight - 56
    );

    // Read the presentation data.
    this.open();
  }

  async open() {
    const { presentationDescriptor } = this.props;

    // Construct the presentation.
    const slyRes = await client.fetchSly(presentationDescriptor);
    await slye.sly(this.presentation, slyRes.presentation);
    await sleep(500);
    this.presentation.goTo(0, 0);

    // Render the presentation.
    const render = () => {
      this.presentation.render();
      window.requestAnimationFrame(render);
    };

    // For debugging.
    (window as any).p = this.presentation;

    // Events.
    window.addEventListener("resize", this.onResize, false);

    // Render and then finish loading.
    render();
    this.setState({ isLoading: false });
  }

  onResize = () => {
    this.presentation.resize(innerWidth, innerHeight - 56);
  };

  componentWillReceiveProps(nextProps: AppProps) {
    if (nextProps.presentationDescriptor !== this.props.presentationDescriptor)
      throw new Error("App: `presentationDescriptor` can not be changed.");
  }

  handleContainerRef = (element: HTMLDivElement): void => {
    const { domElement } = this.presentation;
    element.appendChild(domElement);
  };

  render() {
    const { isPlaying, isLoading } = this.state;

    if (isLoading) return null;

    return (
      <Fragment>
        {this.canvasContainer}
        {isPlaying ? (
          <Player
            presentation={this.presentation}
            onExit={() => this.setState({ isPlaying: false })}
          />
        ) : (
          <Editor
            presentation={this.presentation}
            requestPlay={() => this.setState({ isPlaying: true })}
          />
        )}
      </Fragment>
    );
  }
}

const styles: Record<string, React.CSSProperties> = {
  canvasContainer: {
    position: "fixed",
    top: 32,
    left: 0,
    zIndex: -5
  }
};
