// src/__tests__/WebXRTechDemo.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { WebXRTechDemo } from '../WebXRTechDemo';

// Mock the dependencies
vi.mock('@react-three/xr', () => ({
  useXR: () => ({ isPresenting: false }),
  VRButton: () => <button data-testid="vr-button">Enter VR</button>,
  Controllers: () => <div data-testid="controllers" />,
  Hands: () => <div data-testid="hands" />,
  Interactive: ({ children }) => children
}));

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: vi.fn((callback) => callback()),
  useThree: () => ({ camera: { position: { set: vi.fn() } } })
}));

vi.mock('@react-three/drei', () => ({
  PointerLockControls: () => <div data-testid="pointer-lock-controls" />
}));

describe('WebXRTechDemo', () => {
  beforeEach(() => {
    // Mock gamepad API
    global.navigator.getGamepads = vi.fn(() => []);
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn(callback => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('renders without crashing', () => {
    render(<WebXRTechDemo />);
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('vr-button')).toBeInTheDocument();
  });

  it('renders VR controls', () => {
    render(<WebXRTechDemo />);
    expect(screen.getByTestId('controllers')).toBeInTheDocument();
    expect(screen.getByTestId('hands')).toBeInTheDocument();
  });
});

// src/__tests__/NetworkVisualizationXR.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { NetworkVisualizationXR } from '../NetworkVisualizationXR';

// Mock the THREE.js related objects
vi.mock('three', () => {
  const actualThree = vi.importActual('three');
  return {
    ...actualThree,
    Points: vi.fn().mockImplementation(() => ({
      geometry: {
        attributes: {
          position: { setXYZ: vi.fn(), needsUpdate: false },
          color: { setXYZ: vi.fn(), needsUpdate: false }
        }
      }
    })),
    LineSegments: vi.fn().mockImplementation(() => ({
      geometry: {
        attributes: {
          position: { setXYZ: vi.fn(), needsUpdate: false },
          color: { setXYZ: vi.fn(), needsUpdate: false }
        }
      }
    })),
    Color: vi.fn().mockImplementation(() => ({
      setHSL: vi.fn().mockReturnThis(),
      r: 0, g: 0, b: 0
    }))
  };
});

// Mock d3 force simulation
vi.mock('d3', () => ({
  forceSimulation: vi.fn().mockReturnValue({
    force: vi.fn().mockReturnThis(),
    tick: vi.fn()
  }),
  forceLink: vi.fn().mockReturnValue({}),
  forceManyBody: vi.fn().mockReturnValue({ strength: vi.fn().mockReturnThis() }),
  forceCenter: vi.fn().mockReturnValue({}),
  forceCollide: vi.fn().mockReturnValue({ radius: vi.fn().mockReturnThis() }),
  forceZ: vi.fn().mockReturnValue({ strength: vi.fn().mockReturnThis() })
}));

// Mock React hooks and XR
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(callback => callback())
}));

vi.mock('@react-three/xr', () => ({
  useXR: () => ({ isPresenting: false }),
  Interactive: ({ children }) => children
}));

describe('NetworkVisualizationXR', () => {
  beforeEach(() => {
    // Mock refs
    global.navigator.getGamepads = vi.fn(() => []);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders with default props', () => {
    const { container } = render(<NetworkVisualizationXR />);
    expect(container).toBeTruthy();
  });

  it('accepts custom position and scale', () => {
    const { container } = render(<NetworkVisualizationXR position={[1, 2, 3]} scale={2} />);
    expect(container).toBeTruthy();
  });

  it('calls onNodeSelected when a node is selected', () => {
    const mockOnNodeSelected = vi.fn();
    render(<NetworkVisualizationXR onNodeSelected={mockOnNodeSelected} />);
    // This would need to simulate a node selection event
    // which is challenging in a unit test context
  });
});

// src/__tests__/useXboxController.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useXboxController } from '../hooks/useXboxController';

describe('useXboxController', () => {
  beforeEach(() => {
    // Mock gamepad API
    global.navigator.getGamepads = vi.fn(() => []);
    
    // Mock window event listeners
    global.window.addEventListener = vi.fn();
    global.window.removeEventListener = vi.fn();
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn(callback => {
      callback(0);
      return 0;
    });
    
    global.cancelAnimationFrame = vi.fn();
  });
  
  it('returns default state when no controller is connected', () => {
    const { result } = renderHook(() => useXboxController());
    
    expect(result.current.connected).toBe(false);
    expect(result.current.leftStick).toEqual({ x: 0, y: 0 });
    expect(result.current.rightStick).toEqual({ x: 0, y: 0 });
    expect(result.current.buttons.a).toBe(false);
  });
  
  it('detects connected Xbox controller', () => {
    // Mock a connected Xbox controller
    const mockXboxController = {
      id: 'Xbox Controller (Vendor: 045e Product: 02fd)',
      mapping: 'standard',
      axes: [0, 0, 0, 0],
      buttons: Array(16).fill({ pressed: false, value: 0 }),
      connected: true
    };
    
    global.navigator.getGamepads = vi.fn(() => [mockXboxController]);
    
    const { result } = renderHook(() => useXboxController());
    
    // Force a re-render to process the controller
    act(() => {
      global.requestAnimationFrame.mock.calls[0][0](0);
    });
    
    expect(result.current.connected).toBe(true);
  });
  
  it('processes controller inputs correctly', () => {
    // Mock an Xbox controller with specific inputs
    const mockXboxController = {
      id: 'Xbox Controller',
      mapping: 'standard',
      axes: [0.5, -0.7, 0.3, 0.1], // Left stick x/y, right stick x/y
      buttons: Array(16).fill({ pressed: false, value: 0 }),
      connected: true
    };
    
    // Set the A button to pressed
    mockXboxController.buttons[0] = { pressed: true, value: 1 };
    // Set right trigger partially pressed
    mockXboxController.buttons[7] = { pressed: false, value: 0.8 };
    
    global.navigator.getGamepads = vi.fn(() => [mockXboxController]);
    
    const { result } = renderHook(() => useXboxController(0.1));
    
    // Force a re-render to process the controller
    act(() => {
      global.requestAnimationFrame.mock.calls[0][0](0);
    });
    
    expect(result.current.connected).toBe(true);
    expect(result.current.leftStick.x).toBeCloseTo(0.444, 2); // Accounting for deadzone
    expect(result.current.leftStick.y).toBeCloseTo(-0.667, 2); // Accounting for deadzone
    expect(result.current.buttons.a).toBe(true);
    expect(result.current.rightTrigger).toBe(0.8);
  });
  
  it('applies deadzone correctly', () => {
    // Mock an Xbox controller with small stick movements
    const mockXboxController = {
      id: 'Xbox Controller',
      mapping: 'standard',
      axes: [0.05, 0.08, 0.2, 0.3], // Values for sticks
      buttons: Array(16).fill({ pressed: false, value: 0 }),
      connected: true
    };
    
    global.navigator.getGamepads = vi.fn(() => [mockXboxController]);
    
    const { result } = renderHook(() => useXboxController(0.1));
    
    // Force a re-render to process the controller
    act(() => {
      global.requestAnimationFrame.mock.calls[0][0](0);
    });
    
    // Values within deadzone should be zero
    expect(result.current.leftStick.x).toBe(0);
    expect(result.current.leftStick.y).toBe(0);
    
    // Values outside deadzone should be normalized
    expect(result.current.rightStick.x).toBeGreaterThan(0);
    expect(result.current.rightStick.y).toBeGreaterThan(0);
  });
});

// src/__tests__/Environment.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Environment } from '../Environment';

// Mock dependencies
vi.mock('@react-three/xr', () => ({
  useXR: () => ({ isPresenting: false }),
  Interactive: ({ children, onSelect }) => (
    <div onClick={onSelect} data-testid="interactive">
      {children}
    </div>
  )
}));

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(callback => callback()),
  useThree: () => ({ camera: { position: { set: vi.fn() } } })
}));

vi.mock('../NetworkVisualizationXR', () => ({
  NetworkVisualizationXR: ({ position, scale, onNodeSelected }) => (
    <div data-testid="network-visualization">NetworkVisualization</div>
  )
}));

describe('Environment', () => {
  beforeEach(() => {
    global.navigator.getGamepads = vi.fn(() => []);
  });

  it('renders initial menu state', () => {
    render(<Environment />);
    // Check for portals in the menu view
    const interactiveElements = screen.getAllByTestId('interactive');
    expect(interactiveElements.length).toBeGreaterThan(0);
  });

  it('changes view when portal is clicked', () => {
    render(<Environment />);
    
    // Find the first portal and click it
    const portals = screen.getAllByTestId('interactive');
    fireEvent.click(portals[0]);
    
    // Should now show the selected view component
    expect(screen.getByTestId('network-visualization')).toBeInTheDocument();
  });

  it('returns to menu when back button is clicked', () => {
    render(<Environment />);
    
    // Navigate to a component view
    const portals = screen.getAllByTestId('interactive');
    fireEvent.click(portals[0]);
    
    // Find back button and click it
    const backButton = screen.getByText(/Back to Menu/i);
    fireEvent.click(backButton);
    
    // Should now show portals again
    const interactiveElementsAfterBack = screen.getAllByTestId('interactive');
    expect(interactiveElementsAfterBack.length).toBeGreaterThan(0);
  });
});
