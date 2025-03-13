import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  PresentationControls, 
  Environment, 
  Float, 
  Text, 
  Sky, 
  Stars,
  PerspectiveCamera
} from '@react-three/drei';
import { motion } from 'framer-motion';

// Import visualization components
import { LlamaCore } from '../components/visualizations/LlamaCoreXR';
import { ParticleSystemXR } from '../components/visualizations/ParticleSystemXR';
import { NetworkVisualizationXR } from '../components/visualizations/NetworkVisualizationXR';
import { TerrainMappingXR } from '../components/visualizations/TerrainMappingXR';
import { NeuralNetworkXR } from '../components/visualizations/NeuralNetworkXR';

const DesktopPortfolio = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [canvasVisible, setCanvasVisible] = useState(false);
  const containerRef = useRef(null);
  
  // Show canvas after a short delay for smoother loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanvasVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Portfolio sections
  const sections = [
    { id: 'intro', title: 'Welcome to WebXR Tech Portfolio' },
    { id: 'llama', title: 'LlamaCore Visualization' },
    { id: 'particles', title: 'Particle System' },
    { id: 'network', title: 'Network Visualization' },
    { id: 'terrain', title: 'Terrain Mapping' },
    { id: 'neural', title: 'Neural Network' },
    { id: 'webxr', title: 'Try in WebXR' }
  ];
  
  // Handle section navigation
  const navigateToSection = (index) => {
    setActiveSection(index);
  };
  
  return (
    <div className="desktop-portfolio" ref={containerRef}>
      {/* Navigation sidebar */}
      <div className="portfolio-nav">
        {sections.map((section, index) => (
          <motion.button
            key={section.id}
            className={`nav-button ${activeSection === index ? 'active' : ''}`}
            onClick={() => navigateToSection(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {section.title}
          </motion.button>
        ))}
      </div>
      
      {/* Main content */}
      <motion.div 
        className="portfolio-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Section specific content */}
        <div className="section-content">
          {activeSection === 0 && (
            <motion.div 
              className="intro-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1>WebXR Tech Portfolio</h1>
              <p>Explore interactive 3D visualizations powered by Three.js and WebXR</p>
              <p>Navigate through the sections to see different technical demos and visualizations</p>
              
              <div className="tech-stack">
                <h3>Technologies:</h3>
                <ul>
                  <li>Three.js</li>
                  <li>React Three Fiber</li>
                  <li>WebXR</li>
                  <li>React</li>
                </ul>
              </div>
              
              <div className="instructions">
                <h3>Instructions:</h3>
                <p>Click and drag to rotate models</p>
                <p>Scroll to zoom in/out</p>
                <p>Click on the WebXR section to experience in VR/AR (if supported by your device)</p>
              </div>
            </motion.div>
          )}
          
          {activeSection === 1 && (
            <motion.div 
              className="section-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2>LlamaCore Visualization</h2>
              <p>This interactive 3D visualization demonstrates real-time data rendering with dynamic color changes based on system health metrics.</p>
              <p>The model changes color from green to red as the health decreases, and becomes more transparent.</p>
              <p>Particle effects surround the model for additional visual interest.</p>
            </motion.div>
          )}
          
          {activeSection === 2 && (
            <motion.div 
              className="section-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2>Particle System</h2>
              <p>Advanced particle systems with instance rendering demonstrate high-performance rendering techniques.</p>
              <p>Thousands of particles are animated in real-time with unique movement patterns and colors.</p>
              <p>The system is optimized for both desktop and VR with dynamic level-of-detail adjustments.</p>
            </motion.div>
          )}
          
          {activeSection === 3 && (
            <motion.div 
              className="section-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2>Network Visualization</h2>
              <p>Interactive network visualization demonstrating node-based data representation.</p>
              <p>Nodes and connections are generated procedurally and can be interacted with.</p>
              <p>The visualization supports real-time data mapping and can be used for displaying complex systems or API relationships.</p>
            </motion.div>
          )}
          
          {activeSection === 4 && (
            <motion.div 
              className="section-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2>Terrain Mapping</h2>
              <p>Real-time terrain visualization with radar-like scanning effect.</p>
              <p>Procedurally generated terrain can represent different environment types: mountains, canyons, coastal areas, and urban landscapes.</p>
              <p>In VR mode, the terrain can be directly manipulated with controllers.</p>
            </motion.div>
          )}
          
          {activeSection === 5 && (
            <motion.div 
              className="section-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2>Neural Network</h2>
              <p>Interactive neural network visualization with dynamic signal propagation.</p>
              <p>Click on neurons to see activation patterns flow through the network.</p>
              <p>Visual representation of machine learning processes with customizable layers and node counts.</p>
            </motion.div>
          )}
          
          {activeSection === 6 && (
            <motion.div 
              className="webxr-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2>Experience in WebXR</h2>
              <p>All of these visualizations are enhanced in WebXR mode, allowing you to:</p>
              <ul>
                <li>Walk around and explore the 3D models from any angle</li>
                <li>Interact using VR controllers or AR touch</li>
                <li>Experience immersive visualizations with depth and scale</li>
                <li>Manipulate objects directly in 3D space</li>
              </ul>
              
              <div className="webxr-cta">
                <a href="/xr" className="webxr-button">Launch in WebXR</a>
                <span className="or">or</span>
                <a href="/xr?ar=1" className="webxr-button ar">Launch in AR</a>
              </div>
              
              <p className="device-note">Note: WebXR requires a compatible device and browser</p>
            </motion.div>
          )}
        </div>
        
        {/* 3D Canvas - conditionally rendered based on active section */}
        {canvasVisible && activeSection > 0 && activeSection < 6 && (
          <div className="canvas-container">
            <Canvas dpr={[1, 2]}>
              <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
              
              <PresentationControls
                global
                rotation={[0, 0, 0]}
                polar={[-Math.PI / 4, Math.PI / 4]}
                azimuth={[-Math.PI / 4, Math.PI / 4]}
                config={{ mass: 2, tension: 400 }}
                snap={{ mass: 4, tension: 400 }}
              >
                <Float rotationIntensity={0.4} floatIntensity={0.4}>
                  {/* Different visualization based on active section */}
                  {activeSection === 1 && <LlamaCore position={[0, 0, 0]} scale={1.5} />}
                  {activeSection === 2 && <ParticleSystemXR position={[0, 0, 0]} scale={0.3} />}
                  {activeSection === 3 && <NetworkVisualizationXR position={[0, 0, 0]} scale={1} />}
                  {activeSection === 4 && <TerrainMappingXR position={[0, 0, 0]} scale={0.5} />}
                  {activeSection === 5 && <NeuralNetworkXR position={[0, 0, 0]} scale={1} />}
                </Float>
              </PresentationControls>
              
              {/* Environment lighting */}
              <Environment preset="sunset" />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={0.5} />
              
              {/* Background elements */}
              <Sky sunPosition={[0, 1, 0]} />
              <Stars radius={100} depth={50} count={1000} factor={4} />
            </Canvas>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DesktopPortfolio;
