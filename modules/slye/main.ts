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

import { Text } from "./components/text";
import { Picture } from "./components/picture";
import { Video } from "./components/video";

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
      scale: 0.05,
      file: files[0]
    });

    component.setPosition(0, 0, 0.1);

    const step = renderer.getCurrentStep();
    renderer.actions.insertComponent(step, component);
  };

  videoBtnClickHandler = async (renderer: slye.Renderer): Promise<void> => {
    const files = await slye.showFileDialog(renderer.presentation.uuid);
    if (!files || !files.length) return;

    const component = await slye.component("slye", "video", {
      file: files[0]
    });

    component.setPosition(0, 0, 0.1);

    const step = renderer.getCurrentStep();
    renderer.actions.insertComponent(step, component);
  };

  init() {
    this.registerFont("Homa", this.assets.load("homa.ttf"));
    this.registerFont("Sahel", this.assets.load("sahel.ttf"));
    this.registerFont("Shellia", this.assets.load("shellia.ttf"));
    this.registerFont("Emoji", this.assets.load("emoji.ttf"));

    this.registerComponent("text", Text);
    slye.addStepbarButton("Text", "text_fields", this.textButtonClickHandler);

    this.registerComponent("picture", Picture);
    slye.addStepbarButton("Picture", "photo", this.picBtnClickHandler);

    this.registerComponent("video", Video);
    slye.addStepbarButton("Video", "video_library", this.videoBtnClickHandler);
  }
}

slye.registerModule("slye", SlyeModule);
