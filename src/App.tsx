import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import DesktopPortfolio from './pages/DesktopPortfolio';
import WebXRPortfolio from './pages/WebXRPortfolio';
import Loader from './components/Loader';
import WebGLContextHandler from './components/utils/WebGLContextHandler';

const App = () => {
  const [webXRSupported, setWebXRSupported] = useState(null);

  // Check WebXR support on mount
  React.useEffect(() => {
    const checkWebXRSupport = async () => {
      if ('xr' in navigator) {
        try {
          // Check if immersive-vr or immersive-ar session is supported
          const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
          const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
          setWebXRSupported(vrSupported || arSupported);
        } catch (error) {
          console.warn('WebXR support check failed:', error);
          setWebXRSupported(false);
        }
      } else {
        setWebXRSupported(false);
      }
    };

    checkWebXRSupport();
  }, []);

  // Show loading state while checking WebXR support
  if (webXRSupported === null) {
    return <Loader message="Checking device capabilities..." />;
  }

  return (
    <WebGLContextHandler>
      <Router>
        <div className="app">
          <Navigation webXRSupported={webXRSupported} />
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<DesktopPortfolio />} />
              {webXRSupported && (
                <Route path="/xr" element={<WebXRPortfolio />} />
              )}
              <Route path="*" element={<DesktopPortfolio />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </WebGLContextHandler>
  );
};

export default App;
