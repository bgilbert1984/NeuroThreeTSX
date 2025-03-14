import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useXR, Interactive, Controllers, Hands, VRButton } from '@react-three/xr';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import * as d3 from 'd3';
import { NetworkVisualizationXR } from './NetworkVisualizationXR';

// Xbox One Controller Support
const XboxControllerInput = ({ onMove, onSelect }) => {
  const [controllers, setControllers] = useState([]);
  
  useEffect(() => {
    // Function to handle gamepad connection/disconnection
    const handleGamepadConnected = (event) => {
      console.log('Gamepad connected:', event.gamepad);
      updateGamepads();
    };

    const handleGamepadDisconnected = (event) => {
      console.log('Gamepad disconnected:', event.gamepad);
      updateGamepads();
    };

    // Function to update the list of connected gamepads
    const updateGamepads = () => {
      const gamepads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
      setControllers(gamepads);
    };

    // Add event listeners
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Initial check for already connected gamepads
    updateGamepads();

    // Cleanup
    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

  // Process controller inputs each frame
  useFrame(() => {
    controllers.forEach(gamepad => {
      // Check if it's an Xbox controller (or compatible)
      if (gamepad.id.includes('Xbox') || gamepad.mapping === 'standard') {
        // Left stick for movement
        const leftStickX = gamepad.axes[0]; // Left/Right
        const leftStickY = gamepad.axes[1]; // Forward/Backward
        
        // Only process movement if stick is moved beyond deadzone
        if (Math.abs(leftStickX) > 0.1 || Math.abs(leftStickY) > 0.1) {
          onMove({
            x: leftStickX * 0.05,
            y: 0,
            z: leftStickY * 0.05
          });
        }
        
        // A button for selection (button index 0)
        if (gamepad.buttons[0].pressed) {
          onSelect();
        }
      }
    });
  });
  
  return null;
};

// Keyboard and Mouse Controls
const KeyboardMouseControls = ({ enabled = true }) => {
  const { camera } = useThree();
  const controlsRef = useRef();
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    speed: 0.1
  });
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!enabled) return;
      switch (e.code) {
        case 'KeyW': setMovement(m => ({ ...m, forward: true })); break;
        case 'KeyS': setMovement(m => ({ ...m, backward: true })); break;
        case 'KeyA': setMovement(m => ({ ...m, left: true })); break;
        case 'KeyD': setMovement(m => ({ ...m, right: true })); break;
      }
    };
    
    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': setMovement(m => ({ ...m, forward: false })); break;
        case 'KeyS': setMovement(m => ({ ...m, backward: false })); break;
        case 'KeyA': setMovement(m => ({ ...m, left: false })); break;
        case 'KeyD': setMovement(m => ({ ...m, right: false })); break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled]);
  
  useFrame(() => {
    if (!enabled || !controlsRef.current) return;
    
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(movement.backward) - Number(movement.forward));
    const sideVector = new THREE.Vector3(Number(movement.left) - Number(movement.right), 0, 0);
    
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(movement.speed);
      
    if (controlsRef.current.isLocked) {
      controlsRef.current.moveRight(-direction.x);
      controlsRef.current.moveForward(-direction.z);
    }
  });
  
  return <PointerLockControls ref={controlsRef} />;
};

// Portal Component
const Portal = ({ position, rotation, title, thumbnail, onClick }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group position={position} rotation={rotation}>
      <Interactive onSelect={onClick} onHover={() => setHovered(true)} onBlur={() => setHovered(false)}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.5, 2]} />
          <meshBasicMaterial color={hovered ? "#4488ff" : "#2266dd"} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Thumbnail */}
        <mesh position={[0, 0.3, 0.01]}>
          <planeGeometry args={[1.3, 1.3]} />
          <meshBasicMaterial map={thumbnail} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Title */}
        <mesh position={[0, -0.7, 0.01]}>
          <planeGeometry args={[1.3, 0.3]} />
          <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
          <Text position={[0, 0, 0.02]} color="white" fontSize={0.15}>{title}</Text>
        </mesh>
      </Interactive>
    </group>
  );
};

// Text Component (simplified version)
const Text = ({ children, position, color = "white", fontSize = 0.1 }) => {
  return (
    <mesh position={position}>
      <textGeometry args={[children, { font: 'helvetiker', size: fontSize, height: 0.01 }]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

// Environment component with navigation and portals
const Environment = () => {
  const { isPresenting } = useXR();
  const [currentView, setCurrentView] = useState('menu');
  const [position, setPosition] = useState(new THREE.Vector3(0, 1.6, 0));
  const thumbnailTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load('/placeholder-thumbnail.jpg');
    return texture;
  }, []);
  
  // Handler for controller/keyboard movement
  const handleMove = (movement) => {
    setPosition(prev => new THREE.Vector3(
      prev.x + movement.x,
      prev.y + movement.y,
      prev.z + movement.z
    ));
  };
  
  return (
    <>
      {/* Xbox controller support */}
      <XboxControllerInput 
        onMove={handleMove} 
        onSelect={() => console.log('Controller select')} 
      />
      
      {/* Mouse/Keyboard controls (disabled in VR mode) */}
      <KeyboardMouseControls enabled={!isPresenting} />
      
      {/* User position/camera */}
      <group position={position}>
        {/* Environment elements will be positioned relative to this */}
      </group>
      
      {/* Menu portals - only show in menu view */}
      {currentView === 'menu' && (
        <>
          <Portal 
            position={[-2, 1.5, -3]} 
            rotation={[0, 0.3, 0]} 
            title="Network Visualization" 
            thumbnail={thumbnailTexture}
            onClick={() => setCurrentView('network')}
          />
          
          <Portal 
            position={[0, 1.5, -3]} 
            rotation={[0, 0, 0]} 
            title="Data Analytics" 
            thumbnail={thumbnailTexture}
            onClick={() => setCurrentView('analytics')}
          />
          
          <Portal 
            position={[2, 1.5, -3]} 
            rotation={[0, -0.3, 0]} 
            title="3D Models" 
            thumbnail={thumbnailTexture}
            onClick={() => setCurrentView('models')}
          />
        </>
      )}
      
      {/* Components */}
      {currentView === 'network' && (
        <>
          <NetworkVisualizationXR position={[0, 1, -3]} scale={2} />
          <mesh position={[0, 2.5, -3]} onClick={() => setCurrentView('menu')}>
            <planeGeometry args={[1, 0.3]} />
            <meshBasicMaterial color="#ff3333" />
            <Text position={[0, 0, 0.01]} color="white">Back to Menu</Text>
          </mesh>
        </>
      )}

      {/* Placeholder for other views */}
      {currentView === 'analytics' && (
        <mesh position={[0, 1.5, -3]} onClick={() => setCurrentView('menu')}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
          <Text position={[0, 1.2, 0]} color="white">Analytics View (Placeholder)</Text>
          <Text position={[0, 0.8, 0]} color="white">Click to return to menu</Text>
        </mesh>
      )}
      
      {currentView === 'models' && (
        <mesh position={[0, 1.5, -3]} onClick={() => setCurrentView('menu')}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="green" />
          <Text position={[0, 1.2, 0]} color="white">3D Models View (Placeholder)</Text>
          <Text position={[0, 0.8, 0]} color="white">Click to return to menu</Text>
        </mesh>
      )}
      
      {/* Environment lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Sky/background */}
      <mesh>
        <sphereGeometry args={[50, 32, 32]} />
        <meshBasicMaterial color="#101020" side={THREE.BackSide} />
      </mesh>
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#222233" />
      </mesh>
    </>
  );
};

// Main App Component
export const WebXRTechDemo = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}>
      <VRButton />
      <Canvas>
        <Environment />
        <Controllers />
        <Hands />
      </Canvas>
    </div>
  );
};

export default WebXRTechDemo;
