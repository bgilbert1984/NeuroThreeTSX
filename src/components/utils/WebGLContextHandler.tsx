import React, { useState, useEffect, useCallback } from 'react';

const WebGLContextHandler = ({ children }) => {
  const [contextLost, setContextLost] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [recoveryFailed, setRecoveryFailed] = useState(false);
  
  const MAX_RECOVERY_ATTEMPTS = 3;
  
  // Handle context loss
  const handleContextLoss = useCallback((event) => {
    event.preventDefault(); // Important for context restoration
    console.warn('WebGL context lost. Attempting to recover...');
    setContextLost(true);
    
    // Increment recovery attempts
    setRecoveryAttempts((prev) => {
      const newAttempts = prev + 1;
      // If we've exceeded max attempts, mark as failed
      if (newAttempts > MAX_RECOVERY_ATTEMPTS) {
        setRecoveryFailed(true);
      }
      return newAttempts;
    });
  }, []);
  
  // Handle context restoration
  const handleContextRestored = useCallback(() => {
    console.log('WebGL context restored');
    setContextLost(false);
    // Don't reset recovery attempts to track total recovery needs
  }, []);
  
  // Set up context loss detection
  useEffect(() => {
    const detectWebGLContextLoss = (e) => {
      const canvas = e.target;
      if (canvas.nodeName === 'CANVAS') {
        handleContextLoss(e);
      }
    };
    
    const detectWebGLContextRestoration = (e) => {
      const canvas = e.target;
      if (canvas.nodeName === 'CANVAS') {
        handleContextRestored();
      }
    };
    
    // Add event listeners to window to catch events from any canvas
    window.addEventListener('webglcontextlost', detectWebGLContextLoss);
    window.addEventListener('webglcontextrestored', detectWebGLContextRestoration);
    
    return () => {
      window.removeEventListener('webglcontextlost', detectWebGLContextLoss);
      window.removeEventListener('webglcontextrestored', detectWebGLContextRestoration);
    };
  }, [handleContextLoss, handleContextRestored]);
  
  // Display error message when context is lost
  if (contextLost) {
    return (
      <div className="webgl-error">
        <div className="webgl-error-content">
          <h2>WebGL Context Lost</h2>
          {recoveryFailed ? (
            <div>
              <p>Unable to recover the 3D rendering context after multiple attempts.</p>
              <p>This may be due to hardware limitations or browser issues.</p>
              <button onClick={() => window.location.reload()}>
                Reload Page
              </button>
            </div>
          ) : (
            <div>
              <p>Your browser's 3D rendering context was lost. Attempting to recover...</p>
              <p>Recovery attempt: {recoveryAttempts}/{MAX_RECOVERY_ATTEMPTS}</p>
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // If everything is fine, render children
  return <>{children}</>;
};

export default WebGLContextHandler;
