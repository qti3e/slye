/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import React, { Component } from "react";
import { sly, Presentation } from "@slye/core";

export interface EditorProps {
  presentationDescriptor: string;
}

export class Editor extends Component<EditorProps> {
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
    // status bar (bottom): 24px & top bar: 24px so decrement by 48.
    const h = () => window.innerHeight - 48;

    this.presentation = new Presentation(presentationDescriptor, w(), h());

    window.addEventListener("resize", () => {
      this.presentation.resize(w(), h());
    }, false);

    this.canvasWrapper = (
      <div
        style={{ position: "fixed", top: 24, left: 0 }}
        ref={this.handleCanvasWrapper} />
    ) as any;

    // Set it into the Map.
    Editor.presentations.set(presentationDescriptor, this.presentation);

    // Construct the presentation.
    const slyRes = await client.fetchSly(presentationDescriptor);
    await sly(this.presentation, slyRes.presentation);
    this.presentation.goTo(0, 0);

    const render = () => {
      this.presentation.render();
      window.requestAnimationFrame(render);
    };
    window.requestAnimationFrame(render);
  }

  render() {
    return (
      <div>
        { this.canvasWrapper }
      </div>
    );
  }
}
