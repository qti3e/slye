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
import * as slye from "@slye/core";
import { ui } from "./ui.binding";

import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import DoneIcon from "@material-ui/icons/Done";

export interface ComponentUIProps {
  presentation: slye.Presentation;
  component: slye.Component;
  x: number;
  y: number;
}

export interface ComponentUIState {
  values: Record<string, any>;
  order: any[];
}

export class ComponentUI extends Component<ComponentUIProps, ComponentUIState> {
  state: ComponentUIState = {
    values: {},
    order: []
  };

  constructor(props: ComponentUIProps) {
    super(props);
    this.setup(props.component, false);
  }

  setup(component: slye.Component, m: boolean): void {
    const { ui } = component;
    const propKeys = ui._order ? [...ui._order] : (Object.keys(ui) as any);

    const values = {} as any;
    for (const key of propKeys) values[key] = component.getProp(key);

    if (m) {
      this.setState({
        values,
        order: propKeys
      });
    } else {
      this.state = {
        values,
        order: propKeys
      };
    }
  }

  componentWillReceiveProps(nextProps: ComponentUIProps) {
    if (this.props.component === nextProps.component) return;
    this.setup(nextProps.component, true);
  }

  onUpdate = (field: string) => (value: any): void => {
    this.setState(state => ({
      values: {
        ...state.values,
        [field]: value
      }
    }));
  };

  done = () => {
    const { presentation, component } = this.props;
    presentation.actions.updateProps(component, this.state.values);
  };

  render() {
    const { order, values } = this.state;
    const { x, y, component } = this.props;
    const left = Math.min(x, innerWidth - 560);

    return (
      <Paper style={{ top: y, left, ...styles.container }} elevation={1}>
        {order.map(key => {
          const C = ui[component.ui[key]];
          return (
            <C
              value={values[key]}
              onUpdate={this.onUpdate(key)}
              key={"ce-" + key}
            />
          );
        })}

        <Divider style={styles.divider} />
        <IconButton color="primary" onClick={this.done} style={styles.icon}>
          <DoneIcon />
        </IconButton>
      </Paper>
    );
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    padding: "2px 4px",
    display: "flex",
    alignItems: "center"
  },
  divider: {
    width: 1,
    height: 35,
    margin: 4
  },
  icon: {
    padding: 10
  }
};
