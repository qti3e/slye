/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import React, { Fragment } from "react";

import { MouseProps } from "./mouse";
import { ArrowProps } from "./arrow";

interface Step {
  text: any;
  mouse?: MouseProps;
  arrows?: ArrowProps[];
}

export const steps: Step[] = [
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
