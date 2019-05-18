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

export type PictureProps = {
  scale: number;
  file: slye.FileBase;
};

export class Picture extends slye.ThreeComponent<PictureProps> {
  ui: UI.UILayout<PictureProps> = [
    //{ name: "scale", widget: UI.SIZE, size: 4 },
    { name: "file", widget: UI.FILE, size: 12 }
  ];

  init() {}

  render() {
    const { scale, file } = this.props;

    const texture = new THREE.Texture();
    texture.generateMipmaps = false;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;

    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: texture,
      transparent: true
    });

    return new Promise<void>(resolve => {
      const image = new Image();
      file.url().then(url => (image.src = url));
      image.onload = () => {
        texture.image = image;
        texture.needsUpdate = true;

        const width = image.width * scale;
        const height = image.height * scale;
        const geometry = new THREE.PlaneBufferGeometry(width, height, 32);
        const plane = new THREE.Mesh(geometry, material);

        this.group.add(plane);
        resolve();
      };
    });
  }
}
