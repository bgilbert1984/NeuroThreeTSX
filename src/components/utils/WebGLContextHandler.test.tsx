import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WebGLContextHandler from '../src/components/utils/WebGLContextHandler';

// Mock canvas and WebGL context
const mockGetContext = vi.fn();
const mockGetSupportedExtensions = vi.fn();

// Mock createElement to provide our canvas mock
vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
  if (tagName === 'canvas') {
    return {
      getContext: mockGetContext,
    } as unknown as HTMLCanvasElement;
  }
  return document.createElement(tagName);
});

describe('WebGLContextHandler Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Default mock implementation for successful WebGL context
    mockGetContext.mockImplementation((contextType) => {
      if (contextType === 'webgl2' || contextType === 'webgl') {
        return {
          getSupportedExtensions: mockGetSupportedExtensions,
        };
      }
      return null;
    });
    
    // Default mock implementation for extensions
    mockGetSupportedExtensions.mockReturnValue([
      'OES_texture_float',
      'WEBGL_depth_texture',
      'OES_element_index_uint'
    ]);
  });

  it('renders children when WebGL is available', async () => {
    render(
      <WebGLContextHandler>
        <div data-testid="child-component">Child Component</div>
      </WebGLContextHandler>
    );
    
    // Initially shows loader
    expect(screen.getByText('Checking WebGL support...')).toBeInTheDocument();
    
    // Wait for WebGL check to complete
    await vi.waitFor(() => {
      expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });
  });

  it('displays error when WebGL is not supported', async () => {
    // Mock WebGL context as not available
    mockGetContext.mockReturnValue(null);
    
    render(
      <WebGLContextHandler>
        <div data-testid="child-component">Child Component</div>
      </WebGLContextHandler>
    );
    
    // Wait for error message
    await vi.waitFor(() => {
      expect(screen.getByText('WebGL Error')).toBeInTheDocument();
      expect(screen.getByText('WebGL is not supported in your browser')).toBeInTheDocument();
    });
    
    // Child component should not be rendered
    expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
  });

  it('displays warnings when preferred extensions are missing', async () => {
    // Mock with missing preferred extensions
    mockGetSupportedExtensions.mockReturnValue(['OES_element_index_uint']);
    
    render(
      <WebGLContextHandler>
        <div data-testid="child-component">Child Component</div>
      </WebGLContextHandler>
    );
    
    // Wait for component to finish loading
    await vi.waitFor(() => {
      expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });
    
    // Warning should be shown
    expect(screen.getByText(/Your browser is missing some WebGL extensions/)).toBeInTheDocument();
  });

  it('allows dismissing warnings', async () => {
    // Mock with missing preferred extensions
    mockGetSupportedExtensions.mockReturnValue(['OES_element_index_uint']);
    
    render(
      <WebGLContextHandler>
        <div data-testid="child-component">Child Component</div>
      </WebGLContextHandler>
    );
    
    // Wait for component to finish loading
    await vi.waitFor(() => {
      expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });
    
    // Warning should be shown
    const dismissButton = screen.getByText('Dismiss');
    expect(dismissButton).toBeInTheDocument();
    
    // Click dismiss button
    fireEvent.click(dismissButton);
    
    // Warning should be gone
    expect(screen.queryByText(/Your browser is missing some WebGL extensions/)).not.toBeInTheDocument();
  });

  it('shows browser-specific instructions for Chrome', async () => {
    // Mock WebGL context as not available
    mockGetContext.mockReturnValue(null);
    
    // Mock userAgent for Chrome
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      configurable: true
    });
    
    render(
      <WebGLContextHandler>
        <div>Child Component</div>
      </WebGLContextHandler>
    );
    
    // Wait for error message with Chrome instructions
    await vi.waitFor(() => {
      expect(screen.getByText('For Chrome users:')).toBeInTheDocument();
      expect(screen.getByText(/chrome:\/\/flags/)).toBeInTheDocument();
    });
  });
});
