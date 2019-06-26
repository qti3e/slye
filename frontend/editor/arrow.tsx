/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import React from "react";

export interface ArrowProps {
  variant: "down" | "left" | "up" | "right";
  x: string;
  y: string;
}

export function Arrow(props: ArrowProps) {
  const { variant, x, y } = props;

  const bottom = `calc(${y})`;
  const left = `calc(${x})`;
  const transform = `rotate(${
    {
      down: 90,
      up: -90,
      left: 180,
      right: 0
    }[variant]
  }deg)`;

  return (
    <svg
      version="1.1"
      x="0px"
      y="0px"
      viewBox="0 0 337.792 337.792"
      style={{
        position: "fixed",
        width: 60,
        transform,
        bottom,
        left,
        zIndex: -5
      }}
    >
      <g>
        <path
          d="M337.792,134.824l-130.824,99.441v-52.216C117.061,173.419,30.735,207.817,0.001,302.41
          C-0.337,180.728,99.895,111.781,206.968,88.488V35.382L337.792,134.824z"
        />
      </g>
    </svg>
  );
}
