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

import { Mouse, MouseProps } from "./mouse";
import { Arrow, ArrowProps } from "./arrow";

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

interface Step {
  text: any;
  mouse?: MouseProps;
  arrows?: ArrowProps[];
}

const steps: Step[] = [
  {
    text: (
      <Fragment>
        Welcome to the Slye tutorial.
        <br />
        <hr />
        Please follow the instructions and do all the exercises and try not to
        do anything other than instructions.
      </Fragment>
    )
  },
  {
    text: (
      <Fragment>
        To move: Hold down left-click and move the mouse horizontally. <br />
        [EXERCISE]: Move the `step` to the center.
      </Fragment>
    ),
    mouse: {
      arrowLeft: true,
      arrowRight: true,
      leftActive: true
    }
  },
  {
    text: "To zoom: Hold down left-click and move the mouse vertically.",
    mouse: {
      leftActive: true
    }
  },
  {
    text: (
      <Fragment>
        To rotate: Hold down ctrl+left-click and move the mouse. <br />
        The rotation is being done around the viewport's center, so to rotate
        around a `Step (Slide)` you need to have it in the center first. <br />
      </Fragment>
    ),
    mouse: {
      arrowLeft: true,
      arrowRight: true,
      leftActive: true,
      keys: "Ctrl"
    }
  },
  {
    text: (
      <Fragment>
        Move the mouse to where the arrow is pointing to, now you can see the
        preview menu, to create a new step, all you have to do is to click on on
        the `+` button.
        <br />
        Tip: To keep the preview menu open click on it's header.
        <br />
        [EXERCISE]: Create a new step.
      </Fragment>
    ),
    arrows: [
      {
        variant: "down",
        x: "50%",
        y: "40px"
      }
    ]
  },
  {
    text: (
      <Fragment>
        Click on a step, now you should see the transform control, using this
        control you must be able to `Translate (move)`, `Rotate` and `Scale` the
        selected step.
        <br />
        To switch the transform control mode, use the new buttons appeared on
        the left side of the screen.
        <hr />
        <b>Keyboard Shortcuts:</b>
        <br />
        <kbd>T</kbd> Switch mode to `Translate`. <br />
        <kbd>R</kbd> Switch mode to `Rotation`. <br />
        <kbd>S</kbd> Switch mode to `Scale`. <br />
        <kbd>Esc</kbd> Close the transform control. <br />
      </Fragment>
    )
  },
  {
    text: (
      <Fragment>
        You can use <kbd>Ctrl</kbd> + <kbd>Z</kbd> to undo an action, also there
        is <kbd>Ctrl</kbd> + <kbd>Y</kbd> to redo a previously undone action.
      </Fragment>
    )
  },
  {
    text: (
      <Fragment>
        Now it's time for you to learn about editing steps. <br />
        In Slye there are two modes, let's call them `Global` and `Local`, in
        global mode you can add new steps or remove/transform steps, while in
        the local mode you're dealing with elements (such as Text, Image, etc.),
        in other words you're editing a single step (slide) and only that step
        is visible.
      </Fragment>
    )
  },
  {
    text: (
      <Fragment>
        Till now we were just browsing the global state, to start editing a
        step, double click on it in the global state.
        <br />
        [EXERCISE]: Double click on an empty step.
      </Fragment>
    )
  },
  {
    text: (
      <Fragment>
        To rotate around the step, hold the left-click and move the mouse.
        <br />
        If you feel lost, you can use <kbd>Ctrl</kbd> + <kbd>F</kbd> to focus on
        the current step.
      </Fragment>
    )
  },
  {
    text: <Fragment>Using the right menu create a new Text element.</Fragment>,
    arrows: [
      {
        variant: "right",
        x: "100% - 130px",
        y: "100% - 100px"
      }
    ]
  },
  {
    text: (
      <Fragment>
        Click on the new element to activate the transform control, the
        transform control in the local mode works exactly the same way it works
        in the global mode with only a single difference, whenever you hold
        <kbd>Alt</kbd> key it becomes disabled.
      </Fragment>
    )
  },
  {
    text: (
      <Fragment>
        Double click on the new element to see its editor. <br />
        You can remove an element by clicking on it and then pressing
        <kbd>Del</kbd>.
      </Fragment>
    )
  },
  {
    text: (
      <Fragment>
        You can go back to global mode by pressing <kbd>Esc</kbd>.
      </Fragment>
    )
  }
];

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

  render() {
    const { open, activeStep } = this.state;

    if (activeStep === steps.length) return null;

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
