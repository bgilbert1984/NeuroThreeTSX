import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import XRMenu from '../src/components/xr/XRMenu';
import * as THREE from 'three';

// Mock React Three XR
vi.mock('@react-three/xr', () => ({
  Interactive: ({ children, onSelect }) => (
    <div data-testid="interactive" onClick={() => onSelect()}>
      {children}
    </div>
  ),
}));

// Mock React Three Drei
vi.mock('@react-three/drei', () => ({
  Text: ({ children, ...props }) => (
    <div data-testid="text" {...props}>
      {children}
    </div>
  ),
}));

// Mock Three.js
vi.mock('three', () => {
  return {
    Vector3: vi.fn((...args) => ({
      ...args,
    })),
  };
});

describe('XRMenu Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const onTeleport = vi.fn();
    const { container } = render(<XRMenu onTeleport={onTeleport} />);
    expect(container).toBeTruthy();
  });

  it('renders menu options', () => {
    const onTeleport = vi.fn();
    const { getAllByTestId } = render(<XRMenu onTeleport={onTeleport} />);
    
    // Should have 5 interactive menu options plus 1 help text
    const interactiveElements = getAllByTestId('interactive');
    expect(interactiveElements.length).toBe(5);
    
    const textElements = getAllByTestId('text');
    // 5 menu items + 1 help text
    expect(textElements.length).toBe(6);
    
    // Check specific menu items
    expect(textElements.some(el => el.textContent === 'LlamaCore')).toBe(true);
    expect(textElements.some(el => el.textContent === 'Particles')).toBe(true);
    expect(textElements.some(el => el.textContent === 'Network')).toBe(true);
    expect(textElements.some(el => el.textContent === 'Terrain')).toBe(true);
    expect(textElements.some(el => el.textContent === 'Neural')).toBe(true);
  });

  it('calls onTeleport when menu item is selected', () => {
    const onTeleport = vi.fn();
    const { getAllByTestId } = render(<XRMenu onTeleport={onTeleport} />);
    
    const interactiveElements = getAllByTestId('interactive');
    
    // Click the first menu item
    interactiveElements[0].click();
    
    // Check if onTeleport was called with a Vector3
    expect(onTeleport).toHaveBeenCalled();
    expect(THREE.Vector3).toHaveBeenCalled();
  });

  it('passes different positions to onTeleport for each menu item', () => {
    const onTeleport = vi.fn();
    const { getAllByTestId } = render(<XRMenu onTeleport={onTeleport} />);
    
    const interactiveElements = getAllByTestId('interactive');
    
    // Click each menu item and store the positions
    const positions = [];
    
    for (let i = 0; i < interactiveElements.length; i++) {
      interactiveElements[i].click();
      positions.push(onTeleport.mock.calls[i][0]);
    }
    
    // Check that each position is different
    const uniquePositions = new Set(positions.map(JSON.stringify));
    expect(uniquePositions.size).toBe(positions.length);
  });

  it('includes help text', () => {
    const onTeleport = vi.fn();
    const { getAllByTestId } = render(<XRMenu onTeleport={onTeleport} />);
    
    const textElements = getAllByTestId('text');
    
    // Find the help text
    const helpText = textElements.find(el => 
      el.textContent === 'Select a destination to teleport'
    );
    
    expect(helpText).toBeTruthy();
  });

  it('positions menu items correctly', () => {
    const onTeleport = vi.fn();
    const { getAllByTestId } = render(<XRMenu onTeleport={onTeleport} />);
    
    const menuItems = getAllByTestId('interactive');
    
    // Check that menu items have different positions
    const positions = menuItems.map(item => item.querySelector('[data-testid="text"]').getAttribute('position'));
    const uniquePositions = new Set(positions);
    
    // Each menu item should have a unique position
    expect(uniquePositions.size).toBeGreaterThan(1);
  });
});
