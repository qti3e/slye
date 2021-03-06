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
import { Vec3 } from "./interfaces";
import { ThreeStep } from "./three/step";

export interface CameraState {
  position: Vec3;
  rotation: Vec3;
}

/**
 * Computes the camera state to look at the given step.
 *
 * @param {ThreeStep} step
 * @param {THREE.PerspectiveCamera} camrea
 * @returns {CameraState}
 */
export function getCameraPosRotForStep(
  step: ThreeStep,
  camrea: THREE.PerspectiveCamera
): CameraState {
  const center: THREE.Vector3 = new THREE.Vector3();
  const box3: THREE.Box3 = new THREE.Box3();
  const targetVec: THREE.Vector3 = new THREE.Vector3();
  const euler: THREE.Euler = new THREE.Euler(0, 0, 0, "XYZ");

  const { fov, far, aspect } = camrea;
  const { x: rx, y: ry, z: rz } = step.getRotation();
  const { x: sx, y: sy } = step.getScale();
  const stepWidth = ThreeStep.width * sx;
  const stepHeight = ThreeStep.height * sy;

  const vFov = THREE.Math.degToRad(fov);
  const farHeight = 2 * Math.tan(vFov / 2) * far;
  const farWidth = farHeight * aspect;
  let distance = (far * stepWidth) / farWidth;
  const presentiveHeight = (stepHeight * far) / distance;
  if (presentiveHeight > farHeight) {
    distance = (far * stepHeight) / farHeight;
  }

  // Find camera's position.
  box3.setFromObject(step.group).getCenter(center);
  center.z = step.group.position.z;
  euler.set(rx, ry, rz);
  targetVec.set(0, 0, distance);
  targetVec.applyEuler(euler);
  targetVec.add(center);

  // Update the camera.
  const { x, y, z } = targetVec;

  return {
    position: { x, y, z },
    rotation: { x: rx, y: ry, z: rz }
  };
}
