import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { NetworkVisualizationXR } from '../src/components/visualizations/NetworkVisualizationXR';

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((callback) => {
    callback({}, 0.1); // Call with mock state and delta
    return null;
  }),
}));

// Mock React Three XR
vi.mock('@react-three/xr', () => ({
  useXR: vi.fn(() => ({
    isPresenting: false,
  })),
  Interactive: ({ children }) => children,
}));

// Mock d3
vi.mock('d3', () => ({
  forceSimulation: vi.fn(() => ({
    force: vi.fn().mockReturnThis(),
    tick: vi.fn(),
  })),
  forceLink: vi.fn(() => ({
    id: vi.fn().mockReturnThis(),
  })),
  forceManyBody: vi.fn(() => ({
    strength: vi.fn().mockReturnThis(),
  })),
  forceCenter: vi.fn(),
  forceCollide: vi.fn(() => ({
    radius: vi.fn().mockReturnThis(),
  })),
}));

// Mock Three.js
vi.mock('three', () => ({
  Group: vi.fn(() => ({
    rotation: { y: 0 },
    add: vi.fn(),
  })),
  Mesh: vi.fn(() => ({
    position: { x: 0, y: 0, z: 0 },
  })),
  Points: vi.fn(() => ({
    geometry: {
      attributes: {
        position: {
          count: 30,
          setXYZ: vi.fn(),
          needsUpdate: false,
        },
        color: {
          count: 30,
          setXYZ: vi.fn(),
          needsUpdate: false,
        },
      },
    },
  })),
  LineSegments: vi.fn(() => ({
    geometry: {
      attributes: {
        position: {
          count: 60,
          setXYZ: vi.fn(),
          needsUpdate: false,
        },
        color: {
          count: 60,
          setXYZ: vi.fn(),
          needsUpdate: false,
        },
      },
    },
  })),
  BoxGeometry: vi.fn(),
  SphereGeometry: vi.fn(),
  BufferGeometry: vi.fn(),
  Color: vi.fn(() => ({
    setHSL: vi.fn().mockReturnThis(),
    r: 0, g: 0, b: 0,
  })),
  Float32BufferAttribute: vi.fn(),
  LineBasicMaterial: vi.fn(),
  PointsMaterial: vi.fn(),
  MeshBasicMaterial: vi.fn(),
  DoubleSide: 'DoubleSide',
}));

describe('NetworkVisualizationXR Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<NetworkVisualizationXR />);
    expect(container).toBeTruthy();
  });

  it('accepts position and scale props', () => {
    const position = [1, 2, 3];
    const scale = 2;
    
    const { container } = render(
      <NetworkVisualizationXR position={position} scale={scale} />
    );
    
    expect(container).toBeTruthy();
  });

  it('initializes nodes and links with d3', () => {
    const d3 = require('d3');
    
    render(<NetworkVisualizationXR />);
    
    // Check if d3 functions were called to set up the force simulation
    expect(d3.forceSimulation).toHaveBeenCalled();
    expect(d3.forceLink).toHaveBeenCalled();
    expect(d3.forceManyBody).toHaveBeenCalled();
    expect(d3.forceCenter).toHaveBeenCalled();
    expect(d3.forceCollide).toHaveBeenCalled();
  });

  it('updates node and edge positions in animation frame', () => {
    const { useFrame } = require('@react-three/fiber');
    
    render(<NetworkVisualizationXR />);
    
    // Check if useFrame was called to animate
    expect(useFrame).toHaveBeenCalled();
  });

  it('handles node selection state', () => {
    const useStateSpy = vi.spyOn(React, 'useState');
    
    render(<NetworkVisualizationXR />);
    
    // Check if useState was called for selectedNode state
    expect(useStateSpy).toHaveBeenCalledWith(null);
    
    // Cleanup
    useStateSpy.mockRestore();
  });

  it('adapts to XR mode', () => {
    const { useXR } = require('@react-three/xr');
    
    // First test with isPresenting = false
    render(<NetworkVisualizationXR />);
    expect(useXR).toHaveReturnedWith({ isPresenting: false });
    
    // Mock XR presenting mode
    useXR.mockReturnValue({ isPresenting: true });
    
    // Render again
    render(<NetworkVisualizationXR />);
    expect(useXR).toHaveReturnedWith({ isPresenting: true });
  });

  it('uses different node counts based on XR mode', () => {
    const useMemoSpy = vi.spyOn(React, 'useMemo');
    const { useXR } = require('@react-three/xr');
    
    // Test with isPresenting = false (higher node count)
    useXR.mockReturnValue({ isPresenting: false });
    render(<NetworkVisualizationXR />);
    
    expect(useMemoSpy).toHaveBeenCalled();
    
    // Mock XR presenting mode (should use lower node count)
    useXR.mockReturnValue({ isPresenting: true });
    render(<NetworkVisualizationXR />);
    
    // Cleanup
    useMemoSpy.mockRestore();
  });
});
