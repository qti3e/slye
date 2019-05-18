/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import * as slye from "@slye/core";
import * as UI from "@slye/core/ui";
import * as THREE from "three";

export type VideoProps = {
  file: slye.FileBase;
};

export class Video extends slye.ThreeComponent<VideoProps> {
  ui: UI.UILayout<VideoProps> = [{ name: "file", widget: UI.FILE, size: 12 }];

  init() {}

  async render() {
    const url = await this.props.file.url();
    const video = document.createElement("video");
    video.src = url;
    video.style.display = "none";
    document.body.appendChild(video);
    video.onloadeddata = () => {
      console.log(video.videoWidth, video.videoHeight);
    };
  }
}
