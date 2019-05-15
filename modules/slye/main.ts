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
  font: slye.FontBase;
  size: number;
  text: string;
  color: number;
};

class Text extends slye.ThreeComponent<TextProps> {
  ui: UI.UILayout<TextProps> = [
    { name: "text", widget: UI.TEXT, size: 12 },
    { name: "font", widget: UI.FONT, size: 9 },
    { name: "size", widget: UI.SIZE, size: 2 },
    { name: "color", widget: UI.COLOR, size: 1 }
  ];

  init() {}

  async render() {
    const { font, size, text, color } = this.props;
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
      color,
      emissive: 0x4e2e11,
      flatShading: true,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);

    this.group.add(mesh);
  }
}

class Template extends slye.ThreeComponent<{}> {
  ui: UI.UILayout<{}> = [] as any;

  init() {}
  async render() {}
}

class SlyeModule extends slye.Module {
  textButtonClickHandler = async (renderer: slye.Renderer): Promise<void> => {
    const component = await slye.component("slye", "text", {
      size: 10,
      font: await slye.font("slye", "Homa"),
      text: "Write...",
      color: 0x896215
    });

    const step = renderer.getCurrentStep();
    renderer.actions.insertComponent(step, component);
  };

  init() {
    this.registerFont("Homa", this.assets.load("homa.ttf"));
    this.registerFont("Sahel", this.assets.load("sahel.ttf"));
    this.registerFont("Shellia", this.assets.load("shellia.ttf"));
    this.registerFont("Emoji", this.assets.load("emoji.ttf"));

    this.registerComponent("template", Template);
    this.registerComponent("text", Text);

    slye.addStepbarButton("Text", "text_fields", this.textButtonClickHandler);
  }
}

slye.registerModule("slye", SlyeModule);
