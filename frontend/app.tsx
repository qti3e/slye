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
import Screenfull from "screenfull";
import * as slye from "@slye/core";

import { Editor } from "./editor";
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
  private readonly presentation: slye.ThreePresentation;
  private readonly renderer: slye.Renderer;

  constructor(props: AppProps) {
    super(props);

    this.state = {
      isPlaying: false,
      isLoading: true
    };

    // status bar (bottom): 24px & top bar: 32px so decrement by 56.
    this.presentation = new slye.ThreePresentation(
      props.presentationDescriptor
    );

    this.renderer = new slye.Renderer(
      this.presentation,
      innerWidth,
      innerHeight - 56
    );

    this.renderer.domElement.classList.add("slye-presentation");

    // Read the presentation data.
    this.open();
  }

  async open() {
    const { presentationDescriptor } = this.props;

    // Construct the presentation.
    const slyRes = await client.fetchSly(presentationDescriptor);

    await slye.sly(this.presentation, slyRes.presentation);
    await sleep(500);
    this.renderer.goTo(this.presentation.steps[0], 0);

    // Render the presentation.
    const render = () => {
      this.renderer.render();
      window.requestAnimationFrame(render);
    };

    // For debugging.
    (window as any).p = this.presentation;

    this.renderer.actions.listener = this.onChange;

    // Render and then finish loading.
    render();
    this.setState({ isLoading: false });
  }

  componentWillReceiveProps(nextProps: AppProps) {
    if (nextProps.presentationDescriptor !== this.props.presentationDescriptor)
      throw new Error("App: `presentationDescriptor` can not be changed.");
  }

  componentWillMount() {
    // Events.
    const { domElement } = this.renderer;
    window.addEventListener("resize", this.onResize, false);
    domElement.addEventListener("mousemove", this.onMouseMove);
  }

  componentWillUnmount() {
    const { domElement } = this.renderer;
    window.removeEventListener("resize", this.onResize);
    domElement.removeEventListener("mousemove", this.onMouseMove);
  }

  handleContainerRef = (element: HTMLDivElement): void => {
    const { domElement } = this.renderer;
    element.appendChild(domElement);
  };

  onMouseMove = (event: MouseEvent): void => {
    const { width, height, offsetTop } = this.renderer.domElement;
    const x = event.offsetX;
    const y = event.offsetY - offsetTop;
    const webglX = (x / width) * 2 - 1;
    const webglY = -(y / height) * 2 + 1;
    let intersected = false;

    this.renderer.raycaster.mouse.set(webglX, webglY);
  };

  onResize = () => {
    const { isPlaying } = this.state;
    let height = isPlaying ? innerHeight : innerHeight - 56;
    this.renderer.resize(innerWidth, height);
  };

  onChange = (forward: boolean, action: string, data: any): void => {
    const { presentationDescriptor } = this.props;
    if (forward) {
      client.forwardAction(presentationDescriptor, action, data);
    } else {
      client.backwardAction(presentationDescriptor, action, data);
    }
  };

  render() {
    const { isPlaying, isLoading } = this.state;

    if (isLoading) return null;

    return (
      <Fragment>
        <div style={styles.canvasContainer} ref={this.handleContainerRef} />
        {isPlaying ? (
          <Player
            renderer={this.renderer}
            onExit={() => this.setState({ isPlaying: false })}
          />
        ) : (
          <Editor
            renderer={this.renderer}
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
