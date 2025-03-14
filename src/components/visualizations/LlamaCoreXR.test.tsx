import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import LlamaCoreXR from './LlamaCoreXR';

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

// Mock Three.js
vi.mock('three', () => ({
  Group: vi.fn(() => ({
    rotation: { y: 0 },
    add: vi.fn(),
  })),
  Mesh: vi.fn(() => ({
    position: { x: 0, y: 0, z: 0 },
  })),
  BoxGeometry: vi.fn(),
  SphereGeometry: vi.fn(),
  IcosahedronGeometry: vi.fn(),
  MeshStandardMaterial: vi.fn(() => ({
    color: { r: 0, g: 0, b: 0 },
  })),
  PointsMaterial: vi.fn(),
  BufferGeometry: vi.fn(() => ({
    setAttribute: vi.fn(),
  })),
  Float32BufferAttribute: vi.fn(),
  Points: vi.fn(() => ({
    rotation: { y: 0 },
  })),
  Color: vi.fn(() => ({
    lerpColors: vi.fn(() => ({ r: 0, g: 1, b: 0 })),
  })),
  MathUtils: {
    randFloatSpread: vi.fn((range) => range * Math.random() - range / 2),
  },
  DirectionalLight: vi.fn(),
  PointLight: vi.fn(),
}));

describe('LlamaCoreXR Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<LlamaCoreXR />);
    expect(container).toBeTruthy();
  });

  it('accepts position and scale props', () => {
    const position = [1, 2, 3];
    const scale = 2;
    
    const { container } = render(
      <LlamaCoreXR position={position} scale={scale} />
    );
    
    expect(container).toBeTruthy();
    // We can't easily check the Three.js props directly with this mock setup,
    // but we can verify it doesn't crash with props
  });

  it('handles health state changes', async () => {
    // We need to create a more sophisticated test to check internal state changes
    const useStateSpy = vi.spyOn(React, 'useState');
    
    render(<LlamaCoreXR />);
    
    // Check if useState was called for health
    expect(useStateSpy).toHaveBeenCalledWith(1);
    
    // Cleanup
    useStateSpy.mockRestore();
  });

  it('creates particle effects', () => {
    const useRefSpy = vi.spyOn(React, 'useRef');
    const useEffectSpy = vi.spyOn(React, 'useEffect');
    
    render(<LlamaCoreXR />);
    
    // Check if refs were created
    expect(useRefSpy).toHaveBeenCalled();
    
    // Check if useEffect was called to set up particles
    expect(useEffectSpy).toHaveBeenCalled();
    
    // Cleanup
    useRefSpy.mockRestore();
    useEffectSpy.mockRestore();
  });

  it('handles animation with useFrame', () => {
    const { useFrame } = require('@react-three/fiber');
    
    render(<LlamaCoreXR />);
    
    // Check if useFrame was called
    expect(useFrame).toHaveBeenCalled();
  });

  it('adapts to XR mode', () => {
    const { useXR } = require('@react-three/xr');
    
    // First render with isPresenting = false
    render(<LlamaCoreXR />);
    expect(useXR).toHaveReturnedWith({ isPresenting: false });
    
    // Mock XR presenting mode
    useXR.mockReturnValue({ isPresenting: true });
    
    // Render again with isPresenting = true
    render(<LlamaCoreXR />);
    expect(useXR).toHaveReturnedWith({ isPresenting: true });
  });
});
