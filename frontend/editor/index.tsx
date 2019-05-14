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
import { sleep } from "../util";

export interface AppProps {
  presentationDescriptor: string;
}

interface AppState {
  isPlaying: boolean;
  isLoading: boolean;
}

export class App extends Component<AppProps, AppState> {
  static readonly renderers: Map<string, slye.Renderer> = new Map();
  private renderer: slye.Renderer;

  constructor(props: AppProps) {
    super(props);

    this.state = {
      isPlaying: false,
      isLoading: true
    };
  }

  async open() {
    const { presentationDescriptor } = this.props;

    if (App.renderers.has(presentationDescriptor)) {
      this.renderer = App.renderers.get(presentationDescriptor);
      return;
    }

    const presentation = new slye.ThreePresentation(presentationDescriptor);

    const renderer = new slye.Renderer(
      presentation,
      innerWidth,
      // status bar (bottom): 24px & top bar: 32px so decrement by 56.
      innerHeight - 56
    );

    this.renderer = renderer;
    App.renderers.set(presentationDescriptor, renderer);
    renderer.domElement.classList.add("slye-presentation");

    // Load the presentation.
    const sync = new slye.Sync(
      presentation,
      new slye.ThreeSerializer(),
      {
        onMessage(handler: (msg: string) => void): void {
          client.syncChannelOnMessage(presentationDescriptor, handler);
        },
        send(msg: string): void {
          console.log(msg);
          client.syncChannelSend(presentationDescriptor, msg);
        }
      },
      slye.sly
    );
    sync.bind(renderer.actions);

    const render = () => {
      this.renderer.render();
      requestAnimationFrame(render);
    };

    await sync.waitForOpen();
    this.renderer.goTo(presentation.steps[0], 0);
    this.renderer.initMapCamera();

    render();
    this.setState({ isLoading: false });
  }

  componentWillReceiveProps(nextProps: AppProps) {
    if (nextProps.presentationDescriptor !== this.props.presentationDescriptor)
      throw new Error("App: `presentationDescriptor` can not be changed.");
  }

  componentWillMount() {
    // Load the presentation.
    this.open();
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
