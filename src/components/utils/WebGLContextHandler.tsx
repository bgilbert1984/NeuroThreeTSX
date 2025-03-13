import React, { useEffect, useState } from 'react';
import { Loader } from '../Loader';

interface WebGLContextHandlerProps {
  children: React.ReactNode;
}

interface WebGLError {
  type: 'WEBGL_UNSUPPORTED' | 'WEBGL_ERROR' | 'EXTENSION_MISSING';
  message: string;
  missingExtensions?: string[];
}

const WebGLContextHandler: React.FC<WebGLContextHandlerProps> = ({ children }) => {
  const [isWebGLAvailable, setIsWebGLAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<WebGLError | null>(null);
  const [hasWarnings, setHasWarnings] = useState<boolean>(false);

  useEffect(() => {
    const checkWebGLSupport = (): void => {
      try {
        const canvas = document.createElement('canvas');
        
        // Try WebGL2 first, then fall back to WebGL1
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!gl) {
          setError({
            type: 'WEBGL_UNSUPPORTED',
            message: 'WebGL is not supported in your browser'
          });
          setIsWebGLAvailable(false);
          return;
        }

        // Check for required and optional extensions
        const extensions = gl.getSupportedExtensions() || [];
        
        // Critical extensions that we absolutely need
        const criticalExtensions = [];
        
        // Preferred extensions that enhance experience but we can work without
        const preferredExtensions = ['OES_texture_float', 'WEBGL_depth_texture'];
        
        const missingCritical = criticalExtensions.filter(
          ext => !extensions.includes(ext)
        );

        const missingPreferred = preferredExtensions.filter(
          ext => !extensions.includes(ext)
        );
        
        // If critical extensions are missing, show an error
        if (missingCritical.length > 0) {
          setError({
            type: 'EXTENSION_MISSING',
            message: `Missing critical WebGL extensions: ${missingCritical.join(', ')}`,
            missingExtensions: missingCritical
          });
          setIsWebGLAvailable(false);
          return;
        }
        
        // If only preferred extensions are missing, show a warning but continue
        if (missingPreferred.length > 0) {
          setHasWarnings(true);
          console.warn(`Missing preferred WebGL extensions: ${missingPreferred.join(', ')}. Some visual features may be limited.`);
          // Store this in localStorage to avoid showing the warning again
          localStorage.setItem('webgl-extension-warning', JSON.stringify({
            warned: true,
            missingExtensions: missingPreferred
          }));
        }
        
        setIsWebGLAvailable(true);
      } catch (err) {
        setError({
          type: 'WEBGL_ERROR',
          message: err instanceof Error ? err.message : 'Unknown WebGL error'
        });
        setIsWebGLAvailable(false);
      }
    };
    
    checkWebGLSupport();
  }, []);

  const getBrowserSpecificInstructions = () => {
    const browser = detectBrowser();
    switch (browser) {
      case 'chrome':
        return (
          <>
            <p>For Chrome users:</p>
            <ol>
              <li>Type <code>chrome://flags</code> in your address bar</li>
              <li>Search for "WebGL" and enable "Override software rendering list"</li>
              <li>Restart Chrome</li>
            </ol>
          </>
        );
      case 'firefox':
        return (
          <>
            <p>For Firefox users:</p>
            <ol>
              <li>Type <code>about:config</code> in your address bar</li>
              <li>Search for <code>webgl.force-enabled</code> and set it to <code>true</code></li>
              <li>Restart Firefox</li>
            </ol>
          </>
        );
      default:
        return (
          <p>Try updating your graphics drivers or using a different browser such as Chrome or Firefox.</p>
        );
    }
  };

  const detectBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('chrome') > -1) return 'chrome';
    if (userAgent.indexOf('firefox') > -1) return 'firefox';
    if (userAgent.indexOf('safari') > -1) return 'safari';
    if (userAgent.indexOf('edge') > -1) return 'edge';
    return 'unknown';
  };

  const dismissWarning = () => {
    setHasWarnings(false);
  };

  if (isWebGLAvailable === null) {
    return <Loader message="Checking WebGL support..." />;
  }

  if (!isWebGLAvailable) {
    return (
      <div className="webgl-error">
        <h2>WebGL Error</h2>
        <p>{error?.message || 'Unable to initialize WebGL'}</p>
        <div className="webgl-help">
          {getBrowserSpecificInstructions()}
        </div>
        <p>If you continue to experience issues, your device may not support WebGL or may have it disabled.</p>
      </div>
    );
  }

  return (
    <>
      {hasWarnings && (
        <div className="webgl-warning">
          <p>
            <strong>Note:</strong> Your browser is missing some WebGL extensions. 
            Some visual features may be limited or appear different.
          </p>
          <button onClick={dismissWarning}>Dismiss</button>
        </div>
      )}
      {children}
    </>
  );
};

export default WebGLContextHandler;
