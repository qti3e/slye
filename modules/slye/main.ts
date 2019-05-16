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

type PictureProps = {
  width: number;
  height: number;
  image: slye.FileBase;
};

class Picture extends slye.ThreeComponent<PictureProps> {
  ui: UI.UILayout<PictureProps> = [
    { name: "width", widget: UI.SIZE, size: 2 },
    { name: "height", widget: UI.SIZE, size: 2 }
  ];

  init() {}

  async render() {
    const { height, width, image: img } = this.props;
    const ab = await img.load();

    const texture = new THREE.Texture();
    texture.generateMipmaps = false;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;

    const imageBlob = new Blob([ab], { type: "image/png" });
    const url = URL.createObjectURL(imageBlob);

    const image = new Image();
    image.src = url;
    image.onload = () => {
      texture.image = image;
      texture.needsUpdate = true;
    };

    const geometry = new THREE.PlaneBufferGeometry(width, height, 32);
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: texture,
      transparent: true
    });

    const plane = new THREE.Mesh(geometry, material);

    this.group.add(plane);
  }
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

  picBtnClickHandler = async (renderer: slye.Renderer): Promise<void> => {
    const files = await slye.showFileDialog(renderer.presentation.uuid);
    if (!files || !files.length) return;

    const component = await slye.component("slye", "picture", {
      width: 10,
      height: 10,
      image: files[0]
    });

    const step = renderer.getCurrentStep();
    renderer.actions.insertComponent(step, component);
  };

  init() {
    this.registerFont("Homa", this.assets.load("homa.ttf"));
    this.registerFont("Sahel", this.assets.load("sahel.ttf"));
    this.registerFont("Shellia", this.assets.load("shellia.ttf"));
    this.registerFont("Emoji", this.assets.load("emoji.ttf"));

    this.registerComponent("text", Text);
    this.registerComponent("picture", Picture);

    slye.addStepbarButton("Text", "text_fields", this.textButtonClickHandler);
    slye.addStepbarButton("Picture", "photo", this.picBtnClickHandler);
  }
}

slye.registerModule("slye", SlyeModule);
