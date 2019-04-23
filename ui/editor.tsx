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

export interface EditorProps {
  presentationDescriptor: string;
}

export class Editor extends Component<EditorProps> {
  render() {
    return (
      <div>Hey!</div>
    );
  }
}
