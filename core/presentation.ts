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
import { Component } from "./component";
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
   * Whatever we're in `play` mode or not.
   * (otherwise we're probably in the editor.)
   */
  private isPlaying: boolean = false;

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
   * Render the presentation.
   */
  render(): void {
    // Overflow?
    this.frame++;

    if (this.cameraEase) {
      this.cameraEase.position.update(this.frame);
      this.cameraEase.rotation.update(this.frame);
    }

    // When we're in the edit mode (i.e. we're not playing the presentation)
    // everything should be static.
    if (this.isPlaying) {
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

  private intersectClickable(): Intersection[] {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(
      this.raycasterComponentsCache,
      true
    );

    return intersects;
  }

  private intersectAll(): Intersection[] {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    return intersects;
  }

  private findIntersectByUserData<T>(
    intersections: Intersection[],
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
        component instanceof Component ? component : undefined
    );

    if (component) component.click();
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
      component.setOwner(undefined);
      this.scene.add(component.group);
    }
    this.template = component;
  }

  asset(key: string): Promise<ArrayBuffer> {
    return fetchAsset(this.id, key);
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

  goTo(index: number, duration = 120): void {
    // Normalize index.
    if (index < 0) index = this.steps.length + index;
    if (index >= this.steps.length) index %= this.steps.length;

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
    this.goTo(this.currentStep + 1, duration);
  }

  prev(duration = 120): void {
    this.goTo(this.currentStep - 1, duration);
  }
}
