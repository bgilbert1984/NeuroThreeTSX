import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/main.css';

// WebGL context loss detection
const setupWebGLDetection = () => {
  window.addEventListener('webglcontextlost', (event) => {
    // Prevent the default behavior
    event.preventDefault();
    console.warn('WebGL context lost. This may impact 3D functionality.');
  });

  window.addEventListener('webglcontextrestored', () => {
    console.log('WebGL context restored.');
  });
};

// Setup error handlers
const setupErrorHandlers = () => {
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.message);
    // Don't prevent default so errors still show in console
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Don't prevent default so errors still show in console
  });
};

// Initialize app
const initApp = () => {
  try {
    // Setup event handlers
    setupWebGLDetection();
    setupErrorHandlers();
    
    // Mount React app
    const container = document.getElementById('root');
    if (!container) throw new Error('Failed to find the root element');

    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error('Failed to initialize app:', err);
    
    // Show fallback UI
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; background-color: #121220; color: white;">
          <h2>Application Error</h2>
          <p>Sorry, the application could not be loaded.</p>
          <p style="color: #ff6b6b;">Error: ${err.message || 'Unknown error'}</p>
          <button onclick="window.location.reload()" style="padding: 8px 16px; margin-top: 20px; background-color: #4a4acf; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Reload Application
          </button>
        </div>
      `;
    }
  }
};

// Start the application
initApp();