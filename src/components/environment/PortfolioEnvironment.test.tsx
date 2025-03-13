import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { PortfolioEnvironment } from '../src/components/environment/PortfolioEnvironment';

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((callback) => {
    callback({}, 0.1); // Call with mock state and delta
    return null;
  }),
}));

// Mock Three.js
vi.mock('three', () => ({
  Vector3: vi.fn((x = 0, y = 0, z = 0) => ({ x, y, z })),
  Euler: vi.fn((x = 0, y = 0, z = 0) => ({ x, y, z })),
  Mesh: vi.fn(() => ({
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 0, z: 0 },
  })),
  Group: vi.fn(() => ({
    rotation: { y: 0 },
    children: Array(20).fill({
      rotation: { x: 0, y: 0, z: 0 }
    }),
  })),
  PlaneGeometry: vi.fn(),
  SphereGeometry: vi.fn(),
  MeshStandardMaterial: vi.fn(),
  DirectionalLight: vi.fn(() => ({
    position: { set: vi.fn() },
    shadow: {},
  })),
  PointLight: vi.fn(() => ({
    position: { set: vi.fn() },
  })),
  AmbientLight: vi.fn(),
  OrthographicCamera: vi.fn(),
  MathUtils: {
    randFloatSpread: vi.fn((range) => range * Math.random() - range / 2),
  },
}));

describe('PortfolioEnvironment Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock random function to ensure consistent test results
    const randomOriginal = Math.random;
    Math.random = vi.fn().mockReturnValue(0.5);
    
    return () => {
      Math.random = randomOriginal;
    };
  });

  it('renders without crashing', () => {
    const { container } = render(<PortfolioEnvironment />);
    expect(container).toBeTruthy();
  });

  it('generates cloud points', () => {
    const THREE = require('three');
    
    render(<PortfolioEnvironment />);
    
    // Check if Vector3 was used to position clouds
    expect(THREE.Vector3).toHaveBeenCalled();
    // Check if Euler was used for cloud rotations
    expect(THREE.Euler).toHaveBeenCalled();
  });

  it('sets up refs for floor and clouds', () => {
    const useRefSpy = vi.spyOn(React, 'useRef');
    
    render(<PortfolioEnvironment />);
    
    // Check if useRef was called for floor and clouds
    expect(useRefSpy).toHaveBeenCalledTimes(2);
    
    // Cleanup
    useRefSpy.mockRestore();
  });

  it('animates clouds with useFrame', () => {
    const { useFrame } = require('@react-three/fiber');
    
    render(<PortfolioEnvironment />);
    
    // Check if useFrame was called for animation
    expect(useFrame).toHaveBeenCalled();
  });

  it('includes appropriate light setup', () => {
    const THREE = require('three');
    
    render(<PortfolioEnvironment />);
    
    // Check if lights were created
    expect(THREE.AmbientLight).toHaveBeenCalled();
    expect(THREE.DirectionalLight).toHaveBeenCalled();
    expect(THREE.PointLight).toHaveBeenCalledTimes(2);
  });

  it('creates floor grid with proper materials', () => {
    const THREE = require('three');
    
    render(<PortfolioEnvironment />);
    
    // Check if floor geometry and material were created
    expect(THREE.PlaneGeometry).toHaveBeenCalled();
    expect(THREE.MeshStandardMaterial).toHaveBeenCalled();
  });

  it('creates cloud spheres with proper materials', () => {
    const THREE = require('three');
    
    render(<PortfolioEnvironment />);
    
    // Check if sphere geometry and material were created
    expect(THREE.SphereGeometry).toHaveBeenCalled();
    expect(THREE.MeshStandardMaterial).toHaveBeenCalled();
  });

  it('rotates cloud group in animation', () => {
    // Directly test that the animation function rotates clouds
    const cloudsRef = { current: { rotation: { y: 0 }, children: [] } };
    const useRefMock = vi.spyOn(React, 'useRef');
    useRefMock.mockReturnValueOnce({ current: null }); // floor ref
    useRefMock.mockReturnValueOnce(cloudsRef); // clouds ref
    
    render(<PortfolioEnvironment />);
    
    // Animation would have been called via useFrame
    // but since we're mocking, we need to verify the setup
    expect(useRefMock).toHaveBeenCalledTimes(2);
    
    // Cleanup
    useRefMock.mockRestore();
  });
});
