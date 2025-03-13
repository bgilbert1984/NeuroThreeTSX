export interface SceneProps {
    width: number;
    height: number;
}

export interface ThreeDObject {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
}

export interface VisualizationProps {
    position?: [number, number, number];
    scale?: number;
}

export interface XRNavigatorProps {
    onTeleport: (position: THREE.Vector3) => void;
}

export type TerrainType = 'mountains' | 'canyon' | 'coastal' | 'urban';

export interface Section {
    id: string;
    title: string;
}

export interface LoaderProps {
    message?: string;
}

export interface NavigationProps {
    webXRSupported: boolean;
}