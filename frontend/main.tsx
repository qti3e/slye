/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

// If you're looking for the entry file you should go and check renderer.tsx.

import React, { Component } from "react";
import { Dashboard } from "./dashboard";
import { App } from "./app";

interface MainState {
  presentationDescriptor?: string;
}

export class Main extends Component<{}, MainState> {
  constructor(props: {}) {
    super(props);
    this.state = {};
  }

  create = async (title: string, description: string) => {
    const { presentationDescriptor } = await client.create();
    this.setState({
      presentationDescriptor
    });
  };

  render() {
    const { presentationDescriptor } = this.state;
    if (presentationDescriptor)
      return <App presentationDescriptor={presentationDescriptor} />;
    return <Dashboard onCreate={this.create} />;
  }
}