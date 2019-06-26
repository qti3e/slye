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

import { Mouse } from "./mouse";
import { Arrow } from "./arrow";
import { steps } from "./steps";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import MobileStepper from "@material-ui/core/MobileStepper";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

import "./tour.scss";

interface TourState {
  open: boolean;
  activeStep: number;
}

export class Tour extends Component<{}, TourState> {
  state = {
    open: true,
    activeStep: -1
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleStart = () => {
    this.setState({ open: false, activeStep: 0 });
  };

  handleNext = () => {
    this.setState(state => ({ activeStep: state.activeStep + 1 }));
  };

  handleBack = () => {
    this.setState(state => ({ activeStep: state.activeStep - 1 }));
  };

  handleNeverAskAgain = () => {
    this.setState({ open: false, activeStep: steps.length });
  };

  render() {
    const { open, activeStep } = this.state;

    if (activeStep === steps.length) {
      localStorage.setItem("slye-tour-finished", "1");
      return null;
    }

    if (activeStep > -1) {
      const maxStep = steps.length - 1;
      const step = steps[activeStep];
      return (
        <Fragment>
          <div className="tour-step">
            <MobileStepper
              variant="dots"
              steps={steps.length}
              position="static"
              activeStep={activeStep}
              className="stepper"
              nextButton={
                <Button size="small" onClick={this.handleNext}>
                  {activeStep === maxStep ? "Finish" : "Next"}
                  <KeyboardArrowRight />
                </Button>
              }
              backButton={
                <Button
                  size="small"
                  onClick={this.handleBack}
                  disabled={activeStep === 0}
                >
                  <KeyboardArrowLeft />
                  Back
                </Button>
              }
            />
            <Paper square elevation={0} className="body">
              <Typography align="justify">{step.text}</Typography>
            </Paper>
          </div>
          {step.mouse ? <Mouse {...step.mouse} /> : null}
          {step.arrows ? step.arrows.map(props => <Arrow {...props} />) : null}
        </Fragment>
      );
    }

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
          <Button onClick={this.handleNeverAskAgain} color="primary">
            Never ask again
          </Button>
          <Button onClick={this.handleClose} color="primary">
            Ask me later
          </Button>
          <Button onClick={this.handleStart} color="primary">
            Start the tour
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
