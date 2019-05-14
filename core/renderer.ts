/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import { Euler, Vector3, PerspectiveCamera } from "three";
import { Vec3 } from "./interfaces";
import { ThreePresentation } from "./three/presentation";
import { ThreeStep } from "./three/step";
import { Ease, EaseFunctionName } from "./ease";
import { getCameraPosRotForStep } from "./math";
import { Raycaster } from "./raycaster";
import { ActionStack } from "./actionStack";

/**
 * Most of the methods in Renderer methods act differently based on the renderer
 * state which can be one of the following values:
 *
 * `map`: In this mode, renderer does not update the camera and it let's an
 *    external functionality control the camera position and rotation.
 *    when toggling from the map state, renderer memorizes rotation and position
 *    of the camera and resets to those values when we switch to the this state.
 *
 * `step`: In this state, every step is invisible except the current step.
 *
 * `player`: Step's helper plane is invisible in this mode.
 */
export type RendererState = "map" | "step" | "player";

/**
 * Handles rendering of a ThreePresentation.
 */
export class Renderer {
  /**
   * Current rendering state.
   */
  private state: RendererState;

  /**
   * An array of eases that we should update on each animation frame.
   */
  private easeList: Ease<any>[] = [];

  /**
   * Three.js scene.
   */
  public readonly scene: THREE.Scene;

  /**
   * Main camera.
   */
  public readonly camera: PerspectiveCamera;

  /**
   * Three.js WebGL renderer used to render this presentation.
   */
  private readonly webGLRenderer: THREE.WebGLRenderer;

  /**
   * Alias to `renderer.webGLRenderer.domElement`.
   */
  public readonly domElement: HTMLCanvasElement;

  /**
   * Current step.
   */
  private currentStep: ThreeStep;

  /**
   * Raycaster instance.
   */
  public readonly raycaster: Raycaster;

  /**
   * Action stack instance.
   */
  public readonly actions: ActionStack;

  // For toggling `map` state.
  private readonly lastCameraPosition: Vector3 = new Vector3();
  private readonly lastCameraRotation: Euler = new Euler();

  /**
   * Renderer Constructor.
   *
   * @param {ThreePresentation} presentation Presentation object to render.
   * @param {number} width Initial width.
   * @param {number} height Initial height.
   * @param {number} fov Camera's field of view.
   * @param {number} near Camera's near.
   * @param {number} far Camera's far.
   */
  constructor(
    readonly presentation: ThreePresentation,
    private width: number,
    private height: number,
    private readonly fov: number = 75,
    private readonly near: number = 0.1,
    private readonly far: number = 1000
  ) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

    this.webGLRenderer = new THREE.WebGLRenderer();
    this.webGLRenderer.setSize(width, height);
    this.domElement = this.webGLRenderer.domElement;

    this.raycaster = new Raycaster(presentation, this.camera);
    this.actions = new ActionStack(presentation);
    this.scene.add(presentation.group);

    this.goTo(presentation.steps[0], 0);

    // Just for now.
    this.scene.background = new THREE.Color(0xbfd1e5);
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 200, 0);
    this.scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(-30, 100, -100);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    this.scene.add(dirLight);
  }

  /**
   * Add an ease which updates the camera position and rotation.
   *
   * @param {Vec3} position New position.
   * @param {Vec3} rotation New rotation.
   * @param {number} duration Easing duration in ms.
   * @param {boolean} shortRotation Use the shortest rotation to reach the
   * target.
   * @param {EaseFunctionName} easePos Easing used to update position.
   * @param {EaseFunctionName} easeRot Easing used to update rotation.
   * @returns {void}
   */
  private async updateCamera(
    position: Vec3,
    rotation: Vec3,
    duration: number,
    shortRotation: boolean = false,
    easePos: EaseFunctionName = "easeInOutCubic",
    easeRot: EaseFunctionName = easePos
  ): Promise<void> {
    position = {
      x: position.x,
      y: position.y,
      z: position.z
    };
    rotation = {
      x: rotation.x,
      y: rotation.y,
      z: rotation.z
    };
    const { camera } = this;
    if (shortRotation) {
      let { x, y, z } = camera.rotation;
      x %= Math.PI * 2;
      y %= Math.PI * 2;
      z %= Math.PI * 2;
      rotation.x %= Math.PI * 2;
      rotation.y %= Math.PI * 2;
      rotation.z %= Math.PI * 2;
      camera.position.set(x, y, z);
    }
    const t = Date.now();
    const e1 = new Ease(t, duration, camera.position, position, easePos);
    const e2 = new Ease(t, duration, camera.rotation, rotation, easeRot);
    this.addEase(e1, e2);
    await Promise.all([e1.wait(), e2.wait()]);
  }

  /**
   * Make every step invisible except the current step.
   *
   * @return {void}
   */
  private focus(): void {
    const steps = this.presentation.steps;
    for (let i = 0; i < steps.length; ++i) {
      steps[i].group.visible = false;
    }
    if (this.currentStep) this.currentStep.group.visible = true;
  }

  /**
   * Undo focus, make every step visible.
   *
   * @return {void}
   */
  private blur(): void {
    const steps = this.presentation.steps;
    for (let i = 0; i < steps.length; ++i) {
      steps[i].group.visible = true;
    }
  }

  /**
   * Init the Map state's camera position and rotation to look at the first
   * step.
   *
   * @returns {void}
   */
  initMapCamera(): void {
    const step = this.presentation.steps[0];
    if (!step) return;

    const { position, rotation } = getCameraPosRotForStep(step, this.camera);
    position.z += 15;
    this.lastCameraPosition.set(position.x, position.y, position.z);
    this.lastCameraRotation.set(0, 0, 0);
  }

  /**
   * Switch the renderer state, when the new state is the same thing as the
   * previous step, it just simply returns.
   *
   * @param {RendererState} state New state.
   * @returns {Promise<void>}
   */
  async setState(state: RendererState): Promise<void> {
    if (state === this.state) return;

    const prevState = this.state;
    const { camera } = this;
    this.state = state;

    // Turn on the focus.
    if (state === "step") {
      this.focus();
    } else {
      this.blur();
    }

    // Save the camera state.
    if (prevState === "map") {
      this.lastCameraPosition.copy(camera.position);
      this.lastCameraRotation.copy(camera.rotation);
    }

    // Restore the camera state.
    if (state === "map") {
      await this.updateCamera(
        this.lastCameraPosition,
        this.lastCameraRotation,
        1500,
        true,
        "linear"
      );
    } else if (state === "player") {
      this.goTo(this.currentStep);
    }

    ThreeStep.placeholderMatt.visible = state !== "player";
  }

  /**
   * Add an ease to the eases list, so that we update them
   * on every animation frame.
   *
   * @returns {void}
   */
  addEase(...eases: Ease<any>[]): void {
    const objects = eases.map(e => e.obj);
    this.easeList = this.easeList.filter(
      e => !e.finished && objects.indexOf(e.obj) < 0
    );
    this.easeList.push(...eases);
  }

  /**
   * Go to the given step, is `map` state it just returns.
   *
   * @param {ThreeStep} step The step we want to focus on.
   * @param {number} duration How long should it take to focus on the step. (ms)
   * @returns {void}
   */
  goTo(step: ThreeStep, duration: number = 1500): void {
    if (this.state === "map" || !step) return;
    this.currentStep = step;

    const { position, rotation } = getCameraPosRotForStep(step, this.camera);
    this.updateCamera(position, rotation, 2000);

    if (this.state === "step") this.focus();
  }

  /**
   * Go to the next step.
   *
   * @returns {void}
   */
  next(): void {
    const { steps } = this.presentation;
    if (!this.currentStep) return this.goTo(steps[0]);
    const index = (steps.indexOf(this.currentStep) + 1) % steps.length;
    this.goTo(steps[index]);
  }

  /**
   * Go to the previous step.
   *
   * @returns {void}
   */
  prev(): void {
    const { steps } = this.presentation;
    if (!this.currentStep) return this.goTo(steps[0]);
    let index = steps.indexOf(this.currentStep) - 1;
    if (index === -1) {
      this.goTo(steps[steps.length - 1]);
    } else {
      this.goTo(steps[index]);
    }
  }

  /**
   * Resizes the presentation canvas.
   *
   * @param {number} width new width.
   * @param {number} height new height.
   * @return {void}
   */
  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.webGLRenderer.setSize(width, height);
    this.width = width;
    this.height = height;
    if (this.state === "player") this.goTo(this.currentStep, 1000);
  }

  /**
   * Render an animation frame.
   *
   * @returns {void}
   */
  render(): void {
    const time = Date.now();
    for (let i = 0; i < this.easeList.length; ++i) {
      this.easeList[i].update(time);
    }
    this.webGLRenderer.render(this.scene, this.camera);
  }

  /**
   * Returns the current step.
   *
   * @returns {ThreeStep}
   */
  getCurrentStep(): ThreeStep {
    return this.currentStep;
  }
}
