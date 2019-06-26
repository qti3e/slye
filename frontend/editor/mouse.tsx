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

export interface MouseProps {
  leftActive?: boolean;
  rightActive?: boolean;
  caption?: string;
  keys?: string[] | string;
  arrowLeft?: boolean;
  arrowRight?: boolean;
}

export class Mouse extends Component<MouseProps> {
  render() {
    const {
      arrowRight,
      arrowLeft,
      leftActive,
      rightActive,
      caption,
      keys: keysProp
    } = this.props;
    const rightColor = rightActive ? "#f6982e" : "#dfdfdf";
    const leftColor = leftActive ? "#f6982e" : "#dfdfdf";
    const keys: string[] = keysProp
      ? typeof keysProp === "string"
        ? [keysProp]
        : keysProp
      : [];

    return (
      <div className="tour-mouse-container">
        <div className="keys">
          {keys.map(name => (
            <kbd key={"m" + name}>{name.toUpperCase()}</kbd>
          ))}
        </div>
        {arrowLeft && <div className="arrow left" />}
        {arrowRight && <div className="arrow right" />}
        {caption ? <div className="caption">{caption}</div> : null}
        <svg
          version="1.1"
          width="96"
          height="96"
          viewBox="0 0 512 512"
          className="tour-mouse"
        >
          <path
            d="M354.375 219.371v-107.643c-12.442-1.311-25.661-1.833-39.424-1.833-13.742 0-26.962 0.522-39.404 1.833v107.643h78.827z"
            fill="#bcbcbc"
          />
          <path
            d="M185.017 364.042c0 74.936 58.184 135.66 129.945 135.66 71.803 0 129.976-60.723 129.976-135.659v-128.839h-259.922v128.839z"
            fill="#dfdfdf"
          />
          <path
            d="M444.938 219.371v-21.115c0-54.303-30.597-76.237-74.742-84.224v105.339h74.742z"
            fill={rightColor}
          />
          <path
            d="M259.728 114.032c-44.094 7.998-74.711 29.922-74.711 84.224v21.115h74.711v-105.339z"
            fill={leftColor}
          />
          <path
            d="M297.103 97.055h31.662v14.746h-31.662v-14.745z"
            fill="#3299bb"
          />
          <path
            d="M325.335 97.096c0.082-2.15 1.239-52.951-29.778-74.987-17.203-12.226-39.987-13.015-67.728-2.396-40.878 15.678-57.334 63.847-70.553 102.543-8.694 25.406-17.664 51.692-29.614 54.129-5.376 1.085-18.422-1.546-45.374-31.56l-15.237 13.68c26.839 29.891 46.797 41.605 64.696 37.939 23.45-4.782 33.392-33.884 44.903-67.574 12.452-36.475 26.573-77.803 58.501-90.040 20.941-8.028 37.274-8.038 48.538-0.031 18.401 13.066 21.524 46.059 21.176 57.672l20.47 0.624z"
            fill="#424242"
          />
        </svg>
      </div>
    );
  }
}
