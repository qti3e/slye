/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import * as THREE from "three";
import { Ease } from "./ease";
import { Component } from "./component";
import { fetchAsset } from "./server";
import { Step } from "./step";
import { ActionStack } from "./actionStack";
import { Vec3, getCameraPosRotForStep } from "./math";
import { PresentationBase } from "./base";

export type AnimationFrameCb = (frame: number) => void;

/**
 * Main part of the API, provides set of functions to work with
 * a presentation - most of the time there is only one instance
 * of it in user's workspace.
 */
export class Presentation implements PresentationBase {
  /**
   * Active steps in the current presentation.
   */
  readonly steps: Step[] = [];

  /**
   * Three.js scene.
   */
  public readonly scene: THREE.Scene;

  /**
   * Global camera.
   */
  public readonly camera: THREE.PerspectiveCamera;

  /**
   * Three.js WebGL renderer used to render this presentation.
   */
  private readonly renderer: THREE.WebGLRenderer;

  /**
   * HTML5 Canvas Element which is used by renderer.
   */
  public readonly domElement: HTMLCanvasElement;

  /**
   * Action stack.
   * Do modifications on the presentation using provided methods
   * from an action stack, so that you can can undo them and emit
   * delta changes.
   */
  public readonly actions: ActionStack = new ActionStack();

  /**
   * Current step.
   */
  private currentStep: number;

  /**
   * Current frame number.
   */
  private frame: number = 0;

  /**
   * Whatever we're in `play` mode or not.
   * (otherwise we're probably in the editor.)
   */
  public isPlaying: boolean = false;

  /**
   * Whatever we are currently in focus mode or not.
   */
  public isFocused: boolean = false;

  /**
   * Raycaster - to handle events such as click.
   */
  private readonly raycaster: THREE.Raycaster = new THREE.Raycaster();

  /**
   * Mouse position - part of the raycaster implementation.
   */
  private readonly mouse: THREE.Vector2 = new THREE.Vector2();

  /**
   * Cache of components that are clickable.
   */
  private raycasterComponentsCache: THREE.Group[] = [];

  /**
   * Template is also a component.
   */
  private template: Component;

  /**
   * Camera animation.
   */
  private cameraEase: {
    position: Ease<THREE.Vector3>;
    rotation: Ease<THREE.Euler>;
  };

  private animationFrameHandlers: AnimationFrameCb[] = [];

  /**
   * @param width Width of view port.
   * @param height Height of view port.
   * @param fov Camera's Field Of View.
   * @param near Camera's near.
   * @param far Camera's far.
   */
  constructor(
    readonly id: string,
    private width: number,
    private height: number,
    private readonly fov: number = 75,
    private readonly near: number = 0.1,
    private readonly far: number = 1000
  ) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.domElement = this.renderer.domElement;

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
    this.goTo(this.currentStep, 60);
  }

  use(cb: AnimationFrameCb): void {
    this.animationFrameHandlers.push(cb);
  }

  /**
   * Render the presentation.
   */
  render(): void {
    // Overflow?
    this.frame++;

    if (this.cameraEase) {
      this.cameraEase.position.update(this.frame);
      this.cameraEase.rotation.update(this.frame);
    }

    for (let i = 0; i < this.animationFrameHandlers.length; ++i) {
      this.animationFrameHandlers[i](this.frame);
    }

    // When we're in the edit mode (i.e. we're not playing the presentation)
    // everything should be static.
    if (!this.isPlaying) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    if (this.frame % 5 === 0) {
      if (this.intersectClickable().length) {
        this.domElement.style.cursor = "pointer";
      } else {
        this.domElement.style.cursor = "auto";
      }
    }

    if (this.template) {
      this.template.animationFrame(this.frame);
    }

    if (this.steps.length) {
      if (this.steps.length <= 5) {
        for (let i = 0; i < this.steps.length; ++i) {
          this.steps[i].animationFrame(this.frame);
        }
      } else {
        if (this.currentStep) {
          this.steps[this.currentStep].animationFrame(this.frame);
        }
        // At most render 5 steps in each frame.
        let base = (this.frame * 5) % this.steps.length;
        for (let i = 0; i < 5; ++i) {
          let id = (base + i) % this.steps.length;
          // Don't render it twice.
          if (id == this.currentStep) continue;
          this.steps[id].animationFrame(this.frame);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Update the mouse position.
   *
   * @param {number} x World coordinate (-1, 1)
   * @param {number} y World coordinate (-1, 1)
   * @returns {void}
   */
  updateMouse(x: number, y: number): void {
    this.mouse.x = x;
    this.mouse.y = y;
  }

  private intersectClickable(): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(
      this.raycasterComponentsCache,
      true
    );

    return intersects;
  }

  private intersectAll(): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.steps.map(x => x.group),
      true
    );

    return intersects;
  }

  private findIntersectByUserData<T>(
    intersections: THREE.Intersection[],
    cb: (userData: Record<string, any>) => T
  ): T {
    let result: T;
    let tmp: T;
    let minDistance: number = Infinity;

    main_loop: for (const intersection of intersections) {
      if (intersection.distance > minDistance) continue;
      let current = intersection.object;
      tmp = undefined;
      // Search backward. (parents)
      for (; current; current = current.parent) {
        tmp = cb(current.userData);
        if (tmp) {
          result = tmp;
          minDistance = intersection.distance;
          continue main_loop;
        }
      }
      // Search frontward. (children)
      const notVisited = [...intersection.object.children];
      while (notVisited.length) {
        const obj = notVisited.pop();
        tmp = cb(obj.userData);
        if (tmp) {
          result = tmp;
          minDistance = intersection.distance;
          notVisited.length = 0; // Just for fun ;)
          continue main_loop;
        }
        // Cheek the children.
        notVisited.push(...obj.children);
      }
    }

    return result;
  }

  raycastStep(): Step {
    const intersections = this.intersectAll();
    return this.findIntersectByUserData<Step>(intersections, ({ step }) =>
      step instanceof Step ? step : undefined
    );
  }

  raycastComponent(): Component {
    const inters = this.intersectAll();
    return this.findIntersectByUserData<Component>(inters, ({ component }) =>
      component instanceof Component ? component : undefined
    );
  }

  handleClick(): void {
    // This kind of click event is only meant to be part of the `player`.
    if (!this.isPlaying) return;

    const intersections = this.intersectClickable();
    const component = this.findIntersectByUserData<Component>(
      intersections,
      ({ component }) =>
        component instanceof Component && component.isClickable
          ? component
          : undefined
    );

    if (component) component.click();
  }

  /**
   * Set isPlaying to true.
   */
  play(): void {
    this.isPlaying = true;
  }

  /**
   * Set isPlaying to false, it will pause all child (Steps) animations.
   */
  pause(): void {
    this.isPlaying = false;
    // See render function - to understand this line.
    this.domElement.style.cursor = "auto";
  }

  /**
   * Focus on the current step.
   */
  focus(): void {
    this.isFocused = true;
    const step = this.steps[this.currentStep];
    if (!step) return;

    this.template.group.visible = false;
    for (let i = 0; i < this.steps.length; ++i) {
      this.steps[i].group.visible = false;
    }

    step.group.visible = true;
  }

  /**
   * Blur.
   */
  blur(): void {
    this.isFocused = false;
    this.template.group.visible = true;
    for (let i = 0; i < this.steps.length; ++i) {
      this.steps[i].group.visible = true;
    }
  }

  /**
   * Add the given step to current presentation.
   *
   * @param {Step} s step we want to add.
   */
  add(s: Step, index?: number): void {
    s.use(this);
    this.scene.add(s.group);
    this.updateRaycastCache(s);
    if (index) {
      this.steps.splice(index, 0, s);
    } else {
      this.steps.push(s);
    }
  }

  del(s: Step): void {
    if (s.owner !== this) return;
    const index = this.steps.indexOf(s);
    s.unuse();
    this.scene.remove(s.group);
    this.steps.splice(index, 1);
    this.updateRaycastCache(s);
  }

  /**
   * Recheck the given step.
   */
  updateRaycastCache(s: Step): void {
    const newArray: THREE.Group[] = [];

    for (const group of this.raycasterComponentsCache) {
      if (group.userData.component.owner !== s) {
        newArray.push(group);
      }
    }

    if (s.owner === this) {
      for (const c of s.components) {
        if (c.isClickable) {
          newArray.push(c.group);
        }
      }
    }

    this.raycasterComponentsCache = newArray;
  }

  /**
   * Set the world component.
   * TODO(qti3e) We need a Template type.
   */
  setTemplate(component: Component): void {
    if (this.template) {
      this.scene.remove(this.template.group);
    }
    // It will remove the component from its current owner, and also will
    // call updateRaycastCache in case it's needed.
    if (component) {
      component.setOwner(undefined);
      this.scene.add(component.group);
    }
    this.template = component;
  }

  /**
   * Fetch a presentation asset.
   * @param {string} key Asset key.
   * @return {Promise<ArrayBuffer>}
   */
  asset(key: string): Promise<ArrayBuffer> {
    return fetchAsset(this.id, key);
  }

  getStepId(step: Step): number {
    return this.steps.indexOf(step);
  }

  private updateCamera(frames: number, position: Vec3, rotation: Vec3): void {
    this.cameraEase = {
      position: new Ease(this.frame, frames, this.camera.position, position),
      rotation: new Ease(this.frame, frames, this.camera.rotation, rotation)
    };
  }

  goTo(index: number, duration = 120): void {
    // Normalize index.
    if (index > 0 && index >= this.steps.length) index %= this.steps.length;
    else while (index < 0) index = this.steps.length + index;

    this.currentStep = index;
    const step = this.steps[index];

    // In case there is no step.
    if (!step) return;

    const { position, rotation } = getCameraPosRotForStep(step, this.camera);
    this.updateCamera(duration, position, rotation);

    if (this.isFocused) this.focus();
  }

  getCurrentStep(): Step {
    return this.steps[this.currentStep];
  }

  current(duration = 120): void {
    this.goTo(this.currentStep, duration);
  }

  next(duration = 120): void {
    this.goTo(this.currentStep + 1, duration);
  }

  prev(duration = 120): void {
    this.goTo(this.currentStep - 1, duration);
  }
}
