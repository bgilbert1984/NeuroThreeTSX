import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from './Navigation';

// Mock useLocation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({
      pathname: '/'
    })
  };
});

describe('Navigation Component', () => {
  beforeEach(() => {
    window.scrollY = 0;
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders correctly with WebXR support', () => {
    render(
      <BrowserRouter>
        <Navigation webXRSupported={true} />
      </BrowserRouter>
    );

    // Check if the logo is rendered
    expect(screen.getByText('WebXR Portfolio')).toBeInTheDocument();
    
    // Check if both links are rendered
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Try in VR/AR')).toBeInTheDocument();
    
    // "VR/AR Not Supported" text should not be present
    expect(screen.queryByText('VR/AR Not Supported')).not.toBeInTheDocument();
  });

  it('renders correctly without WebXR support', () => {
    render(
      <BrowserRouter>
        <Navigation webXRSupported={false} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('WebXR Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    
    // "Try in VR/AR" link should not be present
    expect(screen.queryByText('Try in VR/AR')).not.toBeInTheDocument();
    
    // "VR/AR Not Supported" text should be present
    expect(screen.getByText('VR/AR Not Supported')).toBeInTheDocument();
  });

  it('handles mobile menu toggling', () => {
    render(
      <BrowserRouter>
        <Navigation webXRSupported={true} />
      </BrowserRouter>
    );
    
    // Mobile menu should initially be closed
    expect(screen.queryByText('Desktop View')).not.toBeInTheDocument();
    
    // Click menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    expect(menuToggle).toBeInTheDocument();
    
    if (menuToggle) {
      fireEvent.click(menuToggle);
      
      // Mobile menu should now be visible
      expect(screen.getByText('Desktop View')).toBeInTheDocument();
      expect(screen.getByText('VR/AR Experience')).toBeInTheDocument();
      
      // Click again to close
      fireEvent.click(menuToggle);
      
      // Mobile menu should be closed
      expect(screen.queryByText('Desktop View')).not.toBeInTheDocument();
    }
  });

  it('updates style when scrolled', () => {
    render(
      <BrowserRouter>
        <Navigation webXRSupported={true} />
      </BrowserRouter>
    );
    
    // Initially not scrolled
    const nav = document.querySelector('.navigation');
    expect(nav).not.toHaveClass('scrolled');
    
    // Simulate scroll
    window.scrollY = 100;
    fireEvent.scroll(window);
    
    // Should have scrolled class
    expect(nav).toHaveClass('scrolled');
  });
});
