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

  private video: HTMLVideoElement;
  private texture: THREE.VideoTexture;
  private material: THREE.MeshBasicMaterial;
  private mesh: THREE.Mesh;

  init() {
    this.video = document.createElement("video");

    this.texture = new THREE.VideoTexture(this.video);
    this.texture.generateMipmaps = false;
    this.texture.wrapS = this.texture.wrapT = THREE.ClampToEdgeWrapping;
    this.texture.minFilter = THREE.LinearFilter;

    this.material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: this.texture,
      transparent: true
    });

    this.mesh = new THREE.Mesh(undefined, this.material);

    this.video.onloadeddata = () => {
      const width = this.video.videoWidth * 0.05;
      const height = this.video.videoHeight * 0.05;

      const geometry = new THREE.PlaneBufferGeometry(width, height, 32);
      this.mesh.geometry = geometry;

      this.group.add(this.mesh);
    };
  }

  async render() {
    const { file } = this.props;
    const url = await file.url();
    this.video.src = url;
  }

  handleClick(): void {
    if (this.video.paused) {
      this.video.play();
    } else {
      this.video.pause();
    }
  }
}
