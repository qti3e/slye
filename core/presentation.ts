/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

import {
  Color,
  BoxHelper,
  Box3,
  Vector2,
  Vector3,
  Euler,
  Raycaster,
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Intersection,
  Group,
  Math as ThreeMath
} from "three";
import { Ease } from "./ease";
import { Component, SlyeComponent } from "./component";
import { fetchAsset } from "./server";
import { Step } from "./step";

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
  private currentStep: number;

  /**
   * Current frame number.
   */
  private frame: number = 0;

  /**
   * Raycaster - to handle events such as click.
   */
  private readonly raycaster: Raycaster = new Raycaster();

  /**
   * Mouse position - part of the raycaster implementation.
   */
  private readonly mouse: Vector2 = new Vector2();

  /**
   * Cache of components that are clickable.
   */
  private raycasterComponentsCache: Group[] = [];

  /**
   * Template is also a component.
   */
  private template: Component;

  /**
   * Camera animation.
   */
  private cameraEase: {
    position: Ease<Vector3>;
    rotation: Ease<Euler>;
  };

  // Some variables, just to reuse the objects - these are used in goTo method.
  private readonly tmpVec: Vector3 = new Vector3();
  private readonly box3: Box3 = new Box3();
  private readonly targetVec: Vector3 = new Vector3();
  private readonly euler: Euler = new Euler(0, 0, 0, "XYZ");

  /**
   * @param width Width of view port.
   * @param height Height of view port.
   * @param fov Camera's Field Of View.
   * @param near Camera's near.
   * @param far Camera's far.
   */
  constructor(
    private readonly id: string,
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

    this.onClick = this.onClick.bind(this);
    this.onMove = this.onMove.bind(this);
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
    this.goTo(this.currentStep);
  }

  /**
   * Render the presentation into the given canvas at the given frame.
   *
   * @param frame
   *  Current frame number.
   */
  render(): void {
    this.frame++;

    if (this.cameraEase) {
      this.cameraEase.position.update(this.frame);
      this.cameraEase.rotation.update(this.frame);
    }

    if (this.frame % 5 === 0) {
      if (this.intersects().length) {
        this.domElement.style.cursor = "pointer";
      } else {
        this.domElement.style.cursor = "auto";
      }
    }

    if (this.template) {
      this.template.render(this.frame);
    }

    if (this.steps.length) {
      if (this.steps.length <= 5) {
        for (let i = 0; i < this.steps.length; ++i) {
          this.steps[i].render(this.frame);
        }
      } else {
        if (this.currentStep) {
          this.steps[this.currentStep].render(this.frame);
        }
        // At most render 5 steps in each frame.
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
  }

  private intersects(): Intersection[] {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(
      this.raycasterComponentsCache,
      true
    );

    return intersects;
  }

  onMove(event: MouseEvent): void {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onClick(): void {
    let tmp: Component;
    let component: Component;
    let minDistance: number = Infinity;

    const intersects = this.intersects();

    for (let i = 0; i < intersects.length; ++i) {
      if (intersects[i].distance > minDistance) continue;
      let current = intersects[i].object;
      for (; current; current = current.parent) {
        tmp = current.userData.component;
        if (tmp instanceof SlyeComponent) {
          component = tmp;
          minDistance = intersects[i].distance;
          break;
        }
      }
    }

    if (component) {
      component.click();
    }
  }

  /**
   * Add the given step to current presentation.
   *
   * @param {Step} s step we want to add.
   */
  add(s: Step): void {
    s.use(this);
    this.steps.push(s);
    this.scene.add(s.group);
    this.updateRaycastCache(s);
  }

  /**
   * Recheck the given step.
   */
  updateRaycastCache(s: Step): void {
    const newArray: Group[] = [];

    for (const group of this.raycasterComponentsCache) {
      if (group.userData.component.owner !== s) {
        newArray.push(group);
      }
    }

    for (const c of s.components) {
      if (c.isClickable) {
        newArray.push(c.group);
      }
    }

    this.raycasterComponentsCache = newArray;
  }

  setTemplate(component: Component): void {
    if (this.template) {
      this.scene.remove(this.template.group);
    }
    // It will remove the component from its current owner, and also will
    // call updateRaycastCache in case it's needed.
    if (component) {
      component.setStep(undefined);
      this.scene.add(component.group);
    }
    this.template = component;
  }

  private updateCamera(
    frames: number,
    x: number,
    y: number,
    z: number,
    rx: number,
    ry: number,
    rz: number
  ): void {
    this.cameraEase = {
      position: new Ease(this.frame, frames, this.camera.position, {
        x,
        y,
        z
      }),
      rotation: new Ease(this.frame, frames, this.camera.rotation, {
        x: rx,
        y: ry,
        z: rz
      })
    };
  }

  showHelpers(): void {
    const red = new Color(0xff0000);
    const green = new Color(0x00ff00);
    for (const step of this.steps) {
      const helper = new BoxHelper(step.group, red);
      helper.update();
      this.scene.add(helper);

      for (const c of step.group.children) {
        const helper = new BoxHelper(c, green);
        helper.update();
        this.scene.add(helper);
      }
    }
  }

  goTo(index: number, duration = 120): void {
    this.currentStep = index;
    const step = this.steps[index];

    // In case there is no step.
    if (!step) return;
    const { x: rx, y: ry, z: rz } = step.getRotation();

    // Find the distance.
    // Set the rotation to zero so we get the right results.
    step.group.rotation.set(0, 0, 0);
    const stepSize = this.box3.setFromObject(step.group).getSize(this.tmpVec);
    const stepWidth = stepSize.x;
    const stepHeight = stepSize.y;
    // Set it to what it used to be.
    step.group.rotation.set(rx, ry, rz);

    const vFov = ThreeMath.degToRad(this.fov);
    const farHeight = 2 * Math.tan(vFov / 2) * this.far;
    const farWidth = farHeight * this.camera.aspect;
    let distance = (this.far * stepWidth) / farWidth / (2 / 3);
    const presentiveHeight = (stepHeight * this.far) / distance;
    if (presentiveHeight > (3 / 4) * farHeight) {
      distance = (this.far * stepHeight) / farHeight / (3 / 4);
    }

    // Find camera's position.
    const center = this.box3.setFromObject(step.group).getCenter(this.tmpVec);
    this.euler.set(rx, ry, rz);
    this.targetVec.set(0, 0, distance);
    this.targetVec.applyEuler(this.euler);
    this.targetVec.add(center);

    // Update the camera.
    const { x, y, z } = this.targetVec;
    this.updateCamera(duration, x, y, z, rx, ry, rz);
  }

  next(duration = 120): void {
    this.currentStep++;
    if (this.currentStep >= this.steps.length) {
      this.currentStep = 0;
    }
    this.goTo(this.currentStep, duration);
  }

  prev(duration = 120): void {
    this.currentStep--;
    if (this.currentStep < 0) {
      this.currentStep = this.steps.length - 1;
    }
    this.goTo(this.currentStep, duration);
  }

  asset(key: string): Promise<ArrayBuffer> {
    return fetchAsset(this.id, key);
  }
}
