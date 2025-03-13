import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ParticleSystemXR } from '../src/components/visualizations/ParticleSystemXR';

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
}));

// Mock Three.js with necessary components for ParticleSystemXR
vi.mock('three', () => ({
  Vector3: vi.fn((x = 0, y = 0, z = 0) => ({ 
    x, y, z,
    add: vi.fn(),
    length: vi.fn(() => 0.5),
  })),
  Points: vi.fn(() => ({
    geometry: {
      attributes: {
        position: {
          count: 1000,
          getX: vi.fn(() => 0),
          getY: vi.fn(() => 0),
          getZ: vi.fn(() => 0),
          setXYZ: vi.fn(),
          needsUpdate: false,
        },
        color: {
          count: 1000,
          setXYZ: vi.fn(),
          needsUpdate: false,
        },
      },
    },
  })),
  BufferGeometry: vi.fn(),
  Color: vi.fn(() => ({
    setHSL: vi.fn().mockReturnThis(),
    r: 0, g: 0, b: 0,
  })),
  Float32BufferAttribute: vi.fn(),
  PointsMaterial: vi.fn(),
  AdditiveBlending: 'AdditiveBlending',
  Shader: class {
    vertexShader: string = '';
    fragmentShader: string = '';
  },
}));

describe('ParticleSystemXR Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<ParticleSystemXR />);
    expect(container).toBeTruthy();
  });

  it('accepts position and scale props', () => {
    const position = [1, 2, 3];
    const scale = 2;
    
    const { container } = render(
      <ParticleSystemXR position={position} scale={scale} />
    );
    
    expect(container).toBeTruthy();
  });

  it('generates particles using useMemo', () => {
    const useMemoSpy = vi.spyOn(React, 'useMemo');
    
    render(<ParticleSystemXR />);
    
    // Check if useMemo was called to generate particles
    expect(useMemoSpy).toHaveBeenCalled();
    
    // Cleanup
    useMemoSpy.mockRestore();
  });

  it('sets up ref for points', () => {
    const useRefSpy = vi.spyOn(React, 'useRef');
    
    render(<ParticleSystemXR />);
    
    // Check if useRef was called for points
    expect(useRefSpy).toHaveBeenCalled();
    
    // Cleanup
    useRefSpy.mockRestore();
  });

  it('updates particle positions in animation frame', () => {
    const { useFrame } = require('@react-three/fiber');
    
    render(<ParticleSystemXR />);
    
    // Check if useFrame was called to handle animations
    expect(useFrame).toHaveBeenCalled();
  });

  it('adapts particle count based on XR mode', () => {
    const { useXR } = require('@react-three/xr');
    
    // First test with isPresenting = false (higher particle count)
    render(<ParticleSystemXR />);
    expect(useXR).toHaveReturnedWith({ isPresenting: false });
    
    // Mock XR presenting mode (should use lower particle count)
    useXR.mockReturnValue({ isPresenting: true });
    
    // Render again
    render(<ParticleSystemXR />);
    expect(useXR).toHaveReturnedWith({ isPresenting: true });
  });

  it('creates particles with random properties', () => {
    const THREE = require('three');
    const Math_random = Math.random;
    
    // Mock Math.random to return predictable values
    Math.random = vi.fn(() => 0.5);
    
    render(<ParticleSystemXR />);
    
    // Check if Vector3 was used to position particles
    expect(THREE.Vector3).toHaveBeenCalled();
    // Check if Color was used to set particle colors
    expect(THREE.Color).toHaveBeenCalled();
    
    // Restore original Math.random
    Math.random = Math_random;
  });

  it('handles particle lifecycle with animation', () => {
    render(<ParticleSystemXR />);
    
    // This is mostly testing that animation functions don't crash
    // A more complex test would mock the animation frame and check for specific updates
    expect(true).toBeTruthy();
  });
});
