/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { WebGLRenderer, Scene, PerspectiveCamera } from "three";
import { Step } from "./step";
import { Vec3 } from "./math";

/**
 * Main part of the API, provides set of functions to work with
 * a presentation - most of the time there is only one instance
 * of it in user's workspace.
 */
export class Presentation {
  /**
   * Active steps in the current presentation.
   */
  private readonly steps: Step[];

  /**
   * Three.js scene.
   */
  private readonly scene: Scene;

  /**
   * Global camera.
   */
  private readonly camera: PerspectiveCamera;

  /**
   * Three.js WebGL renderer used to render this presentation.
   */
  private readonly renderer: WebGLRenderer;

  /**
   * HTML5 Canvas Element which is used by renderer.
   */
  readonly domElement: HTMLCanvasElement;

  /**
   * Current step.
   */
  private readonly currentStep: number;

  /**
   * Current frame number.
   */
  private frame: number;

  /**
   * @param width Width of view port.
   * @param height Height of view port.
   * @param fov Camera's Field Of View.
   * @param near Camera's near.
   * @param far Camera's far.
   */
  constructor(
    private width: number,
    private height: number,
    private readonly fov: number = 75,
    private readonly near: number = 0.1,
    private readonly far: number = 1000
  ) {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(fov, width / height, near, far);

    this.renderer = new WebGLRenderer();
    this.renderer.setSize(width, height);
    this.domElement = this.renderer.domElement;

    this.frame = 0;
  }

  /**
   * Resize the presentation canvas.
   *
   * @param width new width.
   * @param height new height.
   */
  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.width = width;
    this.height = height;
  }

  /**
   * Render the presentation into the given canvas at the given frame.
   *
   * @param frame
   *  Current frame number.
   */
  render(): void {
    this.frame++;

    // TODO(qti3e) A lot of more stuff should happen here.
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Add the given step to current presentation.
   *
   * @param s step we want to add.
   */
  add(s: Step): void {
    s.use(this);
    this.steps.push(s);
  }
}
