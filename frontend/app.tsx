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
import { Dashboard } from "./dashboard";
import { Editor } from "./editor";

interface AppState {
  presentationDescriptor?: string;
}

export class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {};
  }

  create = async (title: string, description: string) => {
    const { presentationDescriptor } = await client.create();
    this.setState({
      presentationDescriptor
    });
  }

  render() {
    const { presentationDescriptor } = this.state;
    if (presentationDescriptor) {
      return <Editor presentationDescriptor={presentationDescriptor}/>;
    }
    return <Dashboard onCreate={this.create} />;
  }
}
