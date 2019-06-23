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

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

interface TourState {
  open: boolean;
}

export class Tour extends Component {
  state = {
    open: true
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleStart = () => {
    alert("TODO");
  };

  render() {
    const { open } = this.state;

    return (
      <Dialog
        open={open}
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Hey!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A tour can walk you through the app so that you can learn more about
            it. Do you want to start the tour?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            Skip
          </Button>
          <Button onClick={this.handleStart} color="primary">
            Start the tour
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
