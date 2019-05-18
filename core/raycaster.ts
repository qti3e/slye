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
import { ThreePresentation } from "./three/presentation";
import { ThreeStep } from "./three/step";
import { ThreeComponent } from "./three/component";

/**
 * Raycaster Implementation.
 */
export class Raycaster {
  /**
   * Mouse position in world coordinate.
   */
  readonly mouse: THREE.Vector2 = new THREE.Vector2();

  /**
   * Three.js backend.
   */
  private readonly raycaster: THREE.Raycaster = new THREE.Raycaster();

  /**
   * Raycaster Constructor.
   *
   * @param {ThreePresentation} presentation
   * @param {THREE.PerspectiveCamera} camera
   */
  constructor(
    private readonly presentation: ThreePresentation,
    private readonly camera: THREE.PerspectiveCamera
  ) {}

  /**
   * Returns all of the intersections.
   *
   * @returns {THREE.Intersection[]}
   */
  intersectInSteps(steps: ThreeStep[]): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(
      steps.map(x => x.group),
      true
    );

    return intersects;
  }

  /**
   * Search between intersections providing userData to the given filter.
   *
   * @param {THREE.Intersection[]} intersections
   * @param {Function} cb Filter.
   * @returns {T}
   */
  findIntersectByUserData<T>(
    intersections: THREE.Intersection[],
    cb: (userData: Record<string, any>) => T
  ): T {
    if (intersections.length === 0) return undefined;

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

  /**
   * Returns the intersected ThreeStep.
   *
   * @returns {ThreeStep}
   */
  raycastStep(): ThreeStep {
    const tmp = this.intersectInSteps(this.presentation.steps);
    return this.findIntersectByUserData<ThreeStep>(tmp, ({ step }) =>
      step instanceof ThreeStep ? step : undefined
    );
  }

  /**
   * Returns the intersected ThreeComponent.
   *
   * @returns {ThreeComponent}
   */
  raycastComponent(): ThreeComponent {
    const tmp = this.intersectInSteps(this.presentation.steps);
    return this.findIntersectByUserData<ThreeComponent>(tmp, ({ component }) =>
      component instanceof ThreeComponent ? component : undefined
    );
  }

  /**
   * Returns the intersected ThreeComponent which is clickable.
   *
   * @param {ThreeStep} Current step to look into.
   * @returns {ThreeComponent}
   */
  raycastClickableComponent(step: ThreeStep): ThreeComponent {
    const tmp = this.intersectInSteps([step]);
    return this.findIntersectByUserData<ThreeComponent>(tmp, ({ component }) =>
      component instanceof ThreeComponent && component.handleClick
        ? component
        : undefined
    );
  }
}
