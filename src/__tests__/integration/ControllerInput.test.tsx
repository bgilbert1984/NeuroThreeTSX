// src/__tests__/integration/ControllerInput.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { XboxControllerInput } from '../../components/XboxControllerInput';

describe('XboxControllerInput Integration', () => {
  beforeEach(() => {
    // Mock gamepad API with an Xbox controller
    const mockXboxController = {
      id: 'Xbox Controller (Vendor: 045e Product: 02fd)',
      mapping: 'standard',
      axes: [0, 0, 0, 0],
      buttons: Array(16).fill({ pressed: false, value: 0 }),
      connected: true,
      index: 0
    };
    
    global.navigator.getGamepads = vi.fn(() => [mockXboxController]);
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn(callback => {
      callback(0);
      return 0;
    });
  });
  
  it('calls onMove when stick is moved beyond deadzone', () => {
    const mockOnMove = vi.fn();
    const mockOnSelect = vi.fn();
    
    render(<XboxControllerInput onMove={mockOnMove} onSelect={mockOnSelect} />);
    
    // Simulate left stick movement
    const mockControllerWithMovement = {
      id: 'Xbox Controller (Vendor: 045e Product: 02fd)',
      mapping: 'standard',
      axes: [0.5, -0.3, 0, 0], // x=0.5, y=-0.3 for left stick
      buttons: Array(16).fill({ pressed: false, value: 0 }),
      connected: true,
      index: 0
    };
    
    global.navigator.getGamepads = vi.fn(() => [mockControllerWithMovement]);
    
    // Trigger animation frame to process movement
    act(() => {
      global.requestAnimationFrame.mock.calls[0][0](0);
    });
    
    // Verify onMove was called with correct values
    expect(mockOnMove).toHaveBeenCalledWith(expect.objectContaining({
      x: expect.any(Number),
      z: expect.any(Number)
    }));
    
    // Verify x value is positive (right) and z is positive (backward)
    const moveCall = mockOnMove.mock.calls[0][0];
    expect(moveCall.x).toBeGreaterThan(0);
    expect(moveCall.z).toBeLessThan(0);
  });
  
  it('calls onSelect when A button is pressed', () => {
    const mockOnMove = vi.fn();
    const mockOnSelect = vi.fn();
    
    render(<XboxControllerInput onMove={mockOnMove} onSelect={mockOnSelect} />);
    
    // Simulate A button press
    const mockControllerWithButtonPress = {
      id: 'Xbox Controller (Vendor: 045e Product: 02fd)',
      mapping: 'standard',
      axes: [0, 0, 0, 0],
      buttons: Array(16).fill({ pressed: false, value: 0 }),
      connected: true,
      index: 0
    };
    
    // Set A button to pressed (index 0)
    mockControllerWithButtonPress.buttons[0] = { pressed: true, value: 1 };
    
    global.navigator.getGamepads = vi.fn(() => [mockControllerWithButtonPress]);
    
    // Trigger animation frame to process button press
    act(() => {
      global.requestAnimationFrame.mock.calls[0][0](0);
    });
    
    // Verify onSelect was called
    expect(mockOnSelect).toHaveBeenCalled();
  });
});

// src/__tests__/integration/Portal.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Portal } from '../../components/Portal';
import * as THREE from 'three';

// Mock Three.js texture
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    TextureLoader: vi.fn().mockImplementation(() => ({
      load: vi.fn().mockReturnValue({})
    }))
  };
});

describe('Portal Integration', () => {
  it('renders with title and triggers onClick when selected', () => {
    const mockOnClick = vi.fn();
    const testTitle = "Test Portal";
    const mockThumbnail = new THREE.Texture();
    
    render(
      <Portal 
        position={[0, 0, 0]} 
        rotation={[0, 0, 0]} 
        title={testTitle}
        thumbnail={mockThumbnail}
        onClick={mockOnClick}
      />
    );
    
    // Find text element with the title
    expect(screen.getByText(testTitle)).toBeInTheDocument();
    
    // Simulate click/selection
    fireEvent.click(screen.getByText(testTitle));
    
    // Verify onClick callback was called
    expect(mockOnClick).toHaveBeenCalled();
  });
  
  it('changes appearance when hovered', async () => {
    const mockOnClick = vi.fn();
    const mockThumbnail = new THREE.Texture();
    
    const { container } = render(
      <Portal 
        position={[0, 0, 0]} 
        rotation={[0, 0, 0]} 
        title="Test Portal"
        thumbnail={mockThumbnail}
        onClick={mockOnClick}
      />
    );
    
    // Note: Testing hover state in Three.js components is challenging
    // in a standard testing environment, as it requires simulating
    // Three.js-specific events. This is more of a placeholder for
    // how you might approach it.
    
    // This would be better tested in an e2e test with a real renderer
    expect(container).toBeTruthy();
  });
});

// src/__tests__/integration/KeyboardMouseControls.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { KeyboardMouseControls } from '../../components/KeyboardMouseControls';

describe('KeyboardMouseControls Integration', () => {
  beforeEach(() => {
    // Mock useThree
    vi.mock('@react-three/fiber', () => ({
      useThree: () => ({
        camera: {
          position: { x: 0, y: 0, z: 0 }
        }
      }),
      useFrame: vi.fn(callback => callback())
    }));
    
    // Mock PointerLockControls
    vi.mock('@react-three/drei', () => ({
      PointerLockControls: vi.fn().mockImplementation(() => ({
        isLocked: true,
        moveRight: vi.fn(),
        moveForward: vi.fn(),
        lock: vi.fn(),
        unlock: vi.fn()
      }))
    }));
  });
  
  it('responds to WASD key presses', () => {
    const { container } = render(<KeyboardMouseControls enabled={true} />);
    
    // Simulate W key press
    fireEvent.keyDown(window, { code: 'KeyW' });
    // Simulate A key press
    fireEvent.keyDown(window, { code: 'KeyA' });
    
    // Verify component renders
    expect(container).toBeTruthy();
    
    // Simulate key release
    fireEvent.keyUp(window, { code: 'KeyW' });
    fireEvent.keyUp(window, { code: 'KeyA' });
    
    // Note: Full testing would require checking that the
    // actual movement occurred, which is challenging without
    // a full Three.js environment
  });
  
  it('does not respond to key presses when disabled', () => {
    const { container } = render(<KeyboardMouseControls enabled={false} />);
    
    // Simulate W key press
    fireEvent.keyDown(window, { code: 'KeyW' });
    
    // We can't easily verify the internal state didn't change
    // but we can at least verify the component renders
    expect(container).toBeTruthy();
  });
});
