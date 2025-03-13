import React, { useEffect, useState } from 'react';
import { Loader } from '../Loader';

interface WebGLContextHandlerProps {
  children: React.ReactNode;
}

interface WebGLError {
  type: 'WEBGL_UNSUPPORTED' | 'WEBGL_ERROR';
  message: string;
}

const WebGLContextHandler: React.FC<WebGLContextHandlerProps> = ({ children }) => {
  const [isWebGLAvailable, setIsWebGLAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<WebGLError | null>(null);

  useEffect(() => {
    const checkWebGLSupport = (): void => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!gl) {
          setError({
            type: 'WEBGL_UNSUPPORTED',
            message: 'WebGL is not supported in your browser'
          });
          setIsWebGLAvailable(false);
          return;
        }

        // Check for required extensions and capabilities
        const extensions = gl.getSupportedExtensions();
        const requiredExtensions = ['OES_texture_float', 'WEBGL_depth_texture'];
        
        const missingExtensions = requiredExtensions.filter(
          ext => !extensions?.includes(ext)
        );

        if (missingExtensions.length > 0) {
          setError({
            type: 'WEBGL_ERROR',
            message: `Missing required WebGL extensions: ${missingExtensions.join(', ')}`
          });
          setIsWebGLAvailable(false);
          return;
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

  if (isWebGLAvailable === null) {
    return <Loader message="Checking WebGL support..." />;
  }

  if (!isWebGLAvailable) {
    return (
      <div className="webgl-error">
        <h2>WebGL Error</h2>
        <p>{error?.message || 'Unable to initialize WebGL'}</p>
        <p>Please try a different browser or device that supports WebGL</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default WebGLContextHandler;
