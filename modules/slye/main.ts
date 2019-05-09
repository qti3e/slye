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

type TextProps = {
  font: slye.Font;
  size: number;
  text: string;
}

class Text extends slye.Component<TextProps> {
  // Currently contextual types are not supported in ts - so we need to
  // explicitly use Widgets type here.
  // https://github.com/Microsoft/TypeScript/issues/31242
  ui: UI.Widgets<TextProps> = {
    font: UI.FONT,
    size: UI.SIZE,
    text: UI.TEXT,
    _order: ["text", "font", "size"]
  };

  init() {}

  async render() {
    const { font, size, text } = this.props;
    const layout = await font.layout(text);
    const shapes = slye.generateShapes(layout, size);

    const geometry = new THREE.ExtrudeGeometry(shapes, {
      steps: 1,
      depth: 2,
      bevelEnabled: false,
      bevelThickness: 0,
      bevelSize: 0,
      bevelSegments: 0
    });

    const material = new THREE.MeshPhongMaterial({
      color: 0x896215,
      emissive: 0x4e2e11,
      flatShading: true,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);

    this.group.add(mesh);
  }
}

class Template extends slye.Component<{}> {
  ui = {};
  init() {}
  async render() {}
}

class SlyeModule extends slye.Module {
  init() {
    this.registerFont("Homa", this.assets.load("homa.ttf"));
    this.registerFont("Sahel", this.assets.load("sahel.ttf"));
    this.registerFont("Shellia", this.assets.load("shellia.ttf"));
    this.registerFont("Emoji", this.assets.load("emoji.ttf"));

    this.registerComponent("template", Template);
    this.registerComponent("text", Text);
  }
}

slye.registerModule("slye", SlyeModule);
