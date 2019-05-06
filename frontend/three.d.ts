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

  export class TrackballControls {
    public rotateSpeed: number;
    public zoomSpeed: number;
    public panSpeed: number;
    public dynamicDampingFactor: number;

    public noZoom: boolean;
    public noPan: boolean;
    public staticMoving: boolean;

    public keys: number[];

    constructor(camera: THREE.Camera, dom?: HTMLElement);

    handleResize(): void;
    update(): void;
  }
}
