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
import { Widgets } from "./widgets";
import * as slye from "@slye/core";
import * as UI from "../../core/ui";

import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

export interface ComponentEditorProps {
  renderer: slye.Renderer;
  component: slye.ThreeComponent;
  x: number;
  y: number;
}

export interface ComponentUIState {
  values: Record<string, any>;
}

export class ComponentEditor extends Component<
  ComponentEditorProps,
  ComponentUIState
> {
  state: ComponentUIState = {
    values: {}
  };

  constructor(props: ComponentEditorProps) {
    super(props);
    this.setup(props.component, false);
  }

  setup(component: slye.ThreeComponent, m: boolean): void {
    const { ui } = component;
    const values: Record<string, any> = {};

    for (let i = 0; i < ui.length; ++i) {
      const { name } = ui[i];
      values[name] = component.props[name];
    }

    if (m) {
      this.setState({ values });
    } else {
      this.state = {
        ...this.state,
        values
      };
    }
  }

  onChange = (name: string, value: any) => {
    this.setState(state => ({
      values: {
        ...state.values,
        [name]: value
      }
    }));
  };

  componentWillReceiveProps(nextProps: ComponentEditorProps) {
    if (this.props.component === nextProps.component) return;
    this.setup(nextProps.component, true);
  }

  done = () => {
    const { renderer, component } = this.props;
    renderer.actions.updateProps(component, this.state.values);
  };

  render() {
    const { x, y, component } = this.props;
    const { values } = this.state;
    const { ui } = component;
    const left = Math.min(x, innerWidth - 600);

    return (
      <Paper style={{ top: y, left, ...styles.container }} elevation={2}>
        <Grid container spacing={0}>
          {ui.map(({ name, size, widget }) => {
            const Widget = Widgets[widget] as any;
            return (
              <Grid key={`v-${name}`} item xs={size} style={{ padding: 5 }}>
                <Widget
                  value={values[name]}
                  onChange={(value: any) => this.onChange(name, value)}
                />
              </Grid>
            );
          })}
        </Grid>

        <Button
          variant="outlined"
          size="medium"
          color="primary"
          style={styles.button}
          onClick={this.done}
        >
          Save
        </Button>
      </Paper>
    );
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    alignItems: "center",
    maxWidth: 500
  },
  button: {
    margin: 10,
    width: "calc(100% - 20px)"
  }
};
