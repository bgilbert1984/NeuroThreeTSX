export interface SceneProps {
    width: number;
    height: number;
}

export interface ThreeDObject {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
}