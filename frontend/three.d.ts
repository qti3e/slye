declare namespace THREE {
  export class TransformControls extends THREE.Object3D {
    public enabled: boolean;
    public showX: boolean;
    public showY: boolean;
    public showZ: boolean;
    public mode: "translate" | "rotate" | "scale";
    public space: "world" | "local";
    public translationSnap: number;
    public rotationSnap: number;
    public size: number;

    constructor(camera: THREE.Camera, dom?: HTMLElement);

    attach(o: THREE.Object3D): void;
    detach(): void;

    setMode(m: "translate" | "rotate" | "scale"): void;
    setSpace(space: "world" | "local"): void;
    setTranslationSnap(n: number): void;
    setRotationSnap(n: number): void;
    setSize(n: number): void;
  }

  export class OrbitControls {
    public enabled: boolean;
    public readonly target: THREE.Vector3;

    constructor(camera: THREE.Camera, dom?: HTMLElement);
  }

  export class MapControls {
    public enabled: boolean;
    public enableDamping: boolean;
    public dampingFactor: number;
    public screenSpacePanning: boolean;
    public minDistance: number;
    public maxDistance: number;
    public maxPolarAngle: number;
    public zoom0: number;
    public position0: THREE.Vector3;
    public target0: THREE.Vector3;

    constructor(camera: THREE.Camera, dom?: HTMLElement);

    saveState(): void;
    reset(): void;
    update(): void;
  }
}
