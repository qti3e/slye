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
import { App } from "./editor";

interface MainState {
  presentationDescriptor?: string;
}

function getQueryVariable(variable: string): string {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
}

export class Main extends Component<{}, MainState> {
  constructor(props: {}) {
    super(props);
    const pd = getQueryVariable("pd");
    this.state = { presentationDescriptor: pd };
  }

  create = async (title: string, description: string) => {
    const { presentationDescriptor } = await client.create();

    client.patchMeta(presentationDescriptor, {
      title,
      description,
      created: Date.now()
    });

    this.setState({
      presentationDescriptor
    });
  };

  open = async () => {
    const { ok, presentationDescriptor } = await client.open();
    if (ok) this.setState({ presentationDescriptor });
  };

  render() {
    const { presentationDescriptor } = this.state;
    if (presentationDescriptor)
      return <App presentationDescriptor={presentationDescriptor} />;
    return <Dashboard onCreate={this.create} onOpen={this.open} />;
  }
}
