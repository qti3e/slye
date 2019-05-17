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
import * as slye from "@slye/core";

import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Button from "@material-ui/core/Button";

export interface FileWidgetProps {
  value: slye.FileBase;
  onChange(file: slye.FileBase): void;
}

export class FileWidget extends Component<FileWidgetProps> {
  handleClick = async () => {
    const { presentationId } = this.props.value;
    const { files } = await client.showFileDialog(presentationId);
    if (!files || !files.length) return;
    const file = new slye.File(presentationId, files[0]);
    this.props.onChange(file);
  };

  render() {
    return (
      <Button
        variant="contained"
        color="default"
        style={{ width: "100%" }}
        onClick={this.handleClick}
      >
        Choose Another File
        <CloudUploadIcon style={{ marginLeft: 10 }} />
      </Button>
    );
  }
}
