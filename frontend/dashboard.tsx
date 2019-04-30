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
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";

export interface DashboardProps {
  onCreate(title: string, description: string): void;
}

export class Dashboard extends Component<DashboardProps> {
  title: string = "";
  description: string = "";

  create = () => {
    this.props.onCreate(this.title, this.description);
  };

  render() {
    return (
      <div style={{padding: 42}}>
        <Typography component="h1" variant="h5" gutterBottom>
          Create your next stunning presentation...
        </Typography>
        <hr />
        <div style={styles.titleWrapper}>
          <TextField
            label="Presentation title"
            margin="normal"
            fullWidth={true}
						defaultValue={this.title}
						onChange={e => this.title = e.currentTarget.value}
          />
        </div>
        <Button variant="contained" color="primary" onClick={this.create}>
          Create
        </Button>
        <TextField
          label="Description (optional)"
          margin="normal"
          fullWidth={true}
          multiline={true}
          rows={5}
          defaultValue={this.description}
          onChange={e => this.description = e.currentTarget.value}
        />
      </div>
    );
  }
}

const styles: Record<string, React.CSSProperties> = {
  titleWrapper: {
    width: "calc(100% - 115px)",
    marginRight: 15,
    display: "inline-flex"
  }
};
