import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Make sure tests are isolated properly
afterEach(() => {
  cleanup();
});

// Mock matchMedia for responsiveness testing
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {},
    dispatchEvent: function() { return true; }
  };
};

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock for requestAnimationFrame
window.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 0);
});

// Mock localStorage
class LocalStorageMock {
  private store: {[key: string]: string} = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock()
});

// Mock for WebGL context
HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return {
      createShader: vi.fn(),
      createProgram: vi.fn(),
      createBuffer: vi.fn(),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      useProgram: vi.fn(),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      drawArrays: vi.fn(),
      canvas: { width: 800, height: 600 },
      enable: vi.fn(),
      createTexture: vi.fn(),
      bindTexture: vi.fn(),
      texImage2D: vi.fn(),
      getSupportedExtensions: vi.fn(() => []),
      getExtension: vi.fn(),
      drawElements: vi.fn(),
      clear: vi.fn(),
      viewport: vi.fn(),
      clearColor: vi.fn(),
    };
  }
  return null;
});

// Mock IntersectionObserver
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
});

// WebXR mocks
Object.defineProperty(navigator, 'xr', {
  value: {
    isSessionSupported: vi.fn(() => Promise.resolve(false)),
    requestSession: vi.fn(),
  },
});

// Three.js mocks
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      render: vi.fn(),
      shadowMap: {},
      domElement: document.createElement('canvas'),
      dispose: vi.fn(),
    })),
  };
});

// Mock React Three Fiber
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber');
  return {
    ...actual,
    useFrame: vi.fn(),
  };
});

// Mock React Three XR
vi.mock('@react-three/xr', async () => {
  const actual = await vi.importActual('@react-three/xr');
  return {
    ...actual,
    useXR: vi.fn(() => ({ isPresenting: false })),
    Interactive: ({ children }) => children,
  };
});