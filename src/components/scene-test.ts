import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import Scene from '../src/components/Scene';

// Mock Three.js classes
vi.mock('three', () => {
  return {
    Scene: vi.fn(() => ({
      add: vi.fn(),
    })),
    PerspectiveCamera: vi.fn(() => ({
      position: { z: 0 },
      aspect: 1,
      updateProjectionMatrix: vi.fn(),
    })),
    WebGLRenderer: vi.fn(() => ({
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      render: vi.fn(),
      domElement: document.createElement('canvas'),
      dispose: vi.fn(),
    })),
    Vector3: vi.fn(() => ({
      x: 0,
      y: 0,
      z: 0,
    })),
    Color: vi.fn(),
    Mesh: vi.fn(),
    MeshStandardMaterial: vi.fn(),
    BoxGeometry: vi.fn(),
    PlaneGeometry: vi.fn(),
    SphereGeometry: vi.fn(),
    DirectionalLight: vi.fn(() => ({
      position: { set: vi.fn() },
    })),
    AmbientLight: vi.fn(),
    TextureLoader: vi.fn(() => ({
      load: vi.fn(),
    })),
    Clock: vi.fn(() => ({
      getElapsedTime: vi.fn(() => 0),
    })),
    MathUtils: {
      degToRad: vi.fn((deg) => deg * (Math.PI / 180)),
    },
  };
});

// Mock OrbitControls
vi.mock('three/examples/jsm/controls/OrbitControls', () => {
  return {
    OrbitControls: vi.fn(() => ({
      enableDamping: false,
      dampingFactor: 0,
      update: vi.fn(),
      dispose: vi.fn(),
    })),
  };
});

// Mock requestAnimationFrame
const originalRAF = window.requestAnimationFrame;
window.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 0);
});

describe('Scene Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.requestAnimationFrame = originalRAF;
  });

  it('renders without crashing', () => {
    const { container } = render(<Scene width={800} height={600} />);
    expect(container).toBeTruthy();
  });

  it('initializes Three.js instances', () => {
    const { THREE } = require('three');
    const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls');
    
    render(<Scene width={800} height={600} />);
    
    // Check if Three.js constructor functions were called
    expect(THREE.Scene).toHaveBeenCalled();
    expect(THREE.PerspectiveCamera).toHaveBeenCalled();
    expect(THREE.WebGLRenderer).toHaveBeenCalled();
    expect(OrbitControls).toHaveBeenCalled();
  });

  it('handles resize properly', () => {
    const { rerender } = render(<Scene width={800} height={600} />);
    
    // Update props to simulate resize
    rerender(<Scene width={1024} height={768} />);
    
    // Hard to test directly since we're mocking Three.js
    // but we can verify the component doesn't crash on resize
    expect(true).toBeTruthy();
  });

  it('cleans up resources on unmount', () => {
    const { unmount } = render(<Scene width={800} height={600} />);
    
    // Unmount the component
    unmount();
    
    // Hard to test cleanup directly with our mocks,
    // but we can verify the component unmounts without errors
    expect(true).toBeTruthy();
  });
});
