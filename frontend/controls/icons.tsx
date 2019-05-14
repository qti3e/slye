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

export function MoveIcon() {
  return (
    <svg
      fill="white"
      height="50px"
      style={{ transform: "translate(17px, 4px)" }}
    >
      <path
        d="M23.805 6.864l-6.588 6.588 1.331 1.331 6.588-6.588 3.099
        3.099v-7.529h-7.529l3.099 3.099zM3.765
        15.059h13.176v13.176h-13.176v-13.176zM5.647
        16.941v9.412h9.412v-9.412h-9.412z"
      />
    </svg>
  );
}

export function RotateIcon() {
  return (
    <svg
      fill="white"
      height="50px"
      style={{ transform: "translate(17px, 10px)" }}
    >
      <path
        d="M22.588 22.588v-3.765l5.647 4.706-5.647
        4.706v-3.765h-5.647v-1.882h5.647zM16.941 22.588v1.866c-0.311
        0.011-0.625 0.016-0.941 0.016-6.757 0-12.235-2.528-12.235-5.647 0-2.349
        3.108-4.363 7.529-5.214v1.86c-3.352 0.623-5.647 1.891-5.647 3.354 0
        1.964 4.135 3.576 9.412 3.749v0.015h1.882zM28.235
        16.941h-13.176v-13.176h13.176v13.176zM26.353
        15.059v-9.412h-9.412v9.412h9.412z"
      />
    </svg>
  );
}

export function ScaleIcon() {
  return (
    <svg
      fill="white"
      height="50px"
      style={{ transform: "translate(19px, 9px)" }}
    >
      <path
        d="M16.941 26.353h9.412v-20.706h-20.706v9.412h11.294v11.294zM3.765
        3.765h24.471v24.471h-24.471v-24.471zM5.647
        26.353h9.412v-9.412h-9.412v9.412z"
      />
    </svg>
  );
}
