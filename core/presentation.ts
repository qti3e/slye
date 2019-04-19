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
  private readonly steps: Step[] = [];

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
  private frame: number = 0;

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

    this.camera.position.z = 5;
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

  // Debug.
  n = 0.005;

  /**
   * Render the presentation into the given canvas at the given frame.
   *
   * @param frame
   *  Current frame number.
   */
  render(): void {
    this.frame++;

    if (this.steps.length) {
      if (this.steps.length <= 5) {
        for (let i = 0; i < this.steps.length; ++i) {
          this.steps[i].render(this.frame);
        }
      } else {
        if (this.currentStep) {
          this.steps[this.currentStep].render(this.frame);
        }
        // At most render 5 steps in each step.
        let base = (this.frame * 5) % this.steps.length;
        for (let i = 0; i < 5; ++i) {
          let id = (base + i) % this.steps.length;
          // Don't render it twice.
          if (id == this.currentStep) continue;
          this.steps[id].render(this.frame);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);

    if (Math.abs(this.camera.rotation.x) > 0.5) {
      this.n = -this.n;
    }

    this.camera.rotation.x += this.n;
  }

  /**
   * Add the given step to current presentation.
   *
   * @param s step we want to add.
   */
  add(s: Step): void {
    s.use(this);
    this.steps.push(s);
    this.scene.add(s.group);
  }
}
