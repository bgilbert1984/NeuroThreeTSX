import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR, Interactive } from '@react-three/xr';
import * as THREE from 'three';

export const NeuralNetworkXR = ({ position = [0, 0, 0], scale = 1 }) => {
  const { isPresenting } = useXR();
  const groupRef = useRef();
  
  // State for neural network
  const [activations, setActivations] = useState([]);
  const [connectionSignals, setConnectionSignals] = useState([]);
  
  // Layer configuration
  const layers = useMemo(() => {
    // Fewer nodes in VR for performance
    const multiplier = isPresenting ? 0.6 : 1;
    
    return [
      { name: "Input", size: Math.ceil(4 * multiplier) },
      { name: "Hidden 1", size: Math.ceil(6 * multiplier) },
      { name: "Hidden 2", size: Math.ceil(8 * multiplier) },
      { name: "Output", size: Math.ceil(3 * multiplier) }
    ];
  }, [isPresenting]);
  
  // Node positions
  const [nodePositions, connectionPaths] = useMemo(() => {
    const layerSpacing = 2 * scale;
    const nodeSpacing = 1 * scale;
    const positions = [];
    const paths = [];
    
    // Calculate positions for each layer
    layers.forEach((layer, layerIndex) => {
      const layerPositions = [];
      const layerX = (layerIndex - (layers.length - 1) / 2) * layerSpacing;
      
      // Position nodes in each layer
      for (let i = 0; i < layer.size; i++) {
        const y = (i - (layer.size - 1) / 2) * nodeSpacing;
        layerPositions.push([layerX, y, 0]);
      }
      
      positions.push(layerPositions);
      
      // Create connections between layers
      if (layerIndex < layers.length - 1) {
        const nextLayer = layers[layerIndex + 1];
        const layerPaths = [];
        
        // Connect each node to all nodes in next layer
        for (let i = 0; i < layer.size; i++) {
          for (let j = 0; j < nextLayer.size; j++) {
            const start = [...layerPositions[i]];
            const end = [
              (layerIndex + 1 - (layers.length - 1) / 2) * layerSpacing,
              (j - (nextLayer.size - 1) / 2) * nodeSpacing,
              0
            ];
            
            // Store connection information
            layerPaths.push({
              start,
              end,
              active: false,
              signalPositions: []
            });
          }
        }
        
        paths.push(layerPaths);
      }
    });
    
    return [positions, paths];
  }, [layers, scale]);
  
  // Initialize activations
  useEffect(() => {
    const newActivations = layers.map((layer) => 
      Array(layer.size).fill(false)
    );
    setActivations(newActivations);
    
    // Initialize signals
    const newConnectionSignals = connectionPaths.map((layerPaths) =>
      layerPaths.map(() => ({
        active: false,
        progress: 0,
        speed: 0.01 + Math.random() * 0.01
      }))
    );
    setConnectionSignals(newConnectionSignals);
  }, [layers, connectionPaths]);
  
  // Create a reference for nodes and connections
  const nodeRefs = useRef([]);
  const connectionRefs = useRef([]);
  
  // Animation loop
  useFrame((state, delta) => {
    // Gently rotate the network in desktop mode
    if (groupRef.current && !isPresenting) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.2;
    }
    
    // Handle animations for activated nodes
    activations.forEach((layerActivations, layerIndex) => {
      layerActivations.forEach((isActive, nodeIndex) => {
        if (!nodeRefs.current[layerIndex]?.[nodeIndex]) return;
        
        const nodeMesh = nodeRefs.current[layerIndex][nodeIndex];
        
        if (isActive) {
          // Pulse effect for active nodes
          const pulseScale = 1 + 0.2 * Math.sin(state.clock.getElapsedTime() * 3);
          nodeMesh.scale.set(pulseScale, pulseScale, pulseScale);
          
          // Make it glow
          if (nodeMesh.material) {
            nodeMesh.material.emissiveIntensity = 0.8 + 0.2 * Math.sin(state.clock.getElapsedTime() * 5);
          }
        } else {
          // Return to normal
          nodeMesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
          if (nodeMesh.material) {
            nodeMesh.material.emissiveIntensity = 0.2;
          }
        }
      });
    });
    
    // Animate connection signals
    const newConnectionSignals = [...connectionSignals];
    
    connectionSignals.forEach((layerSignals, layerIndex) => {
      layerSignals.forEach((signal, connectionIndex) => {
        if (!signal.active) return;
        
        // Update signal progress
        newConnectionSignals[layerIndex][connectionIndex].progress += signal.speed;
        
        // Signal reached destination
        if (signal.progress >= 1) {
          newConnectionSignals[layerIndex][connectionIndex].active = false;
          newConnectionSignals[layerIndex][connectionIndex].progress = 0;
          
          // Activate target node in next layer
          const connection = connectionPaths[layerIndex][connectionIndex];
          const targetLayer = layerIndex + 1;
          const targetNodeCount = layers[targetLayer].size;
          const targetNodeIndex = connectionIndex % targetNodeCount;
          
          if (targetLayer < activations.length) {
            const newActivations = [...activations];
            newActivations[targetLayer][targetNodeIndex] = true;
            setActivations(newActivations);
            
            // Propagate to next layer with random connections
            if (targetLayer < layers.length - 1) {
              setTimeout(() => {
                // Activate some random connections from this node
                const nextLayerConnections = connectionPaths[targetLayer];
                const startIndex = targetNodeIndex * layers[targetLayer + 1].size;
                const endIndex = startIndex + layers[targetLayer + 1].size;
                
                // Randomly activate 1-3 connections
                const activationCount = Math.floor(Math.random() * 3) + 1;
                const newSignals = [...newConnectionSignals];
                
                for (let i = 0; i < activationCount; i++) {
                  const randIndex = startIndex + Math.floor(Math.random() * layers[targetLayer + 1].size);
                  if (randIndex < endIndex) {
                    newSignals[targetLayer][randIndex] = {
                      active: true,
                      progress: 0,
                      speed: 0.01 + Math.random() * 0.01
                    };
                  }
                }
                
                setConnectionSignals(newSignals);
              }, 300 + Math.random() * 200);
            }
          }
        }
      });
    });
    
    setConnectionSignals(newConnectionSignals);
    
    // Update connection visuals
    connectionRefs.current.forEach((layerConnections, layerIndex) => {
      layerConnections?.forEach((connection, connectionIndex) => {
        if (!connection) return;
        
        const signal = connectionSignals[layerIndex][connectionIndex];
        const connectionPath = connectionPaths[layerIndex][connectionIndex];
        
        // Visualize active connections
        if (connection.material) {
          if (signal.active) {
            connection.material.color.set('#88aaff');
            connection.material.opacity = 0.8;
          } else {
            // Default state
            connection.material.color.set('#aaaaaa');
            connection.material.opacity = 0.2;
          }
        }
      });
    });
  });
  
  // Handle node activation on click
  const handleNodeActivate = (layerIndex, nodeIndex) => {
    // Clone state for immutability
    const newActivations = [...activations];
    
    // Toggle activation state
    newActivations[layerIndex][nodeIndex] = !newActivations[layerIndex][nodeIndex];
    setActivations(newActivations);
    
    // If activating an input node
    if (layerIndex === 0 && newActivations[layerIndex][nodeIndex]) {
      // Trigger signals from this node
      const newSignals = [...connectionSignals];
      const nextLayerSize = layers[1].size;
      
      // Activate all connections from this node
      const startConnectionIndex = nodeIndex * nextLayerSize;
      
      for (let i = 0; i < nextLayerSize; i++) {
        newSignals[0][startConnectionIndex + i] = {
          active: true,
          progress: 0,
          speed: 0.01 + Math.random() * 0.01
        };
      }
      
      setConnectionSignals(newSignals);
    }
  };
  
  // Initialize refs arrays
  useEffect(() => {
    nodeRefs.current = layers.map((layer) => Array(layer.size).fill(null));
    
    connectionRefs.current = connectionPaths.map((layerPaths) => 
      Array(layerPaths.length).fill(null)
    );
  }, [layers, connectionPaths]);
  
  // Automatically trigger some input nodes in demo mode
  useEffect(() => {
    if (activations.length === 0) return;
    
    const demoInterval = setInterval(() => {
      // Randomly activate an input node
      if (Math.random() > 0.7) {
        const inputLayerIndex = 0;
        const randomNodeIndex = Math.floor(Math.random() * layers[0].size);
        
        handleNodeActivate(inputLayerIndex, randomNodeIndex);
      }
    }, 2000);
    
    return () => clearInterval(demoInterval);
  }, [activations, layers]);
  
  return (
    <group position={position} ref={groupRef}>
      {/* Neural network nodes */}
      {nodePositions.map((layerPositions, layerIndex) => (
        <React.Fragment key={`layer-${layerIndex}`}>
          {/* Layer label */}
          <mesh position={[layerPositions[0][0], Math.max(...layerPositions.map(p => p[1])) + 0.5, 0]}>
            <textGeometry
              args={[layers[layerIndex].name, { font: undefined, size: 0.1 * scale, height: 0.02 * scale }]}
            />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          
          {/* Nodes */}
          {layerPositions.map((position, nodeIndex) => (
            <Interactive
              key={`node-${layerIndex}-${nodeIndex}`}
              onSelect={() => handleNodeActivate(layerIndex, nodeIndex)}
            >
              <mesh
                position={position}
                ref={(el) => {
                  if (!nodeRefs.current[layerIndex]) nodeRefs.current[layerIndex] = [];
                  nodeRefs.current[layerIndex][nodeIndex] = el;
                }}
              >
                <sphereGeometry args={[0.2 * scale, 16, 16]} />
                <meshStandardMaterial
                  color={activations[layerIndex]?.[nodeIndex] ? '#00aaff' : '#aaaaaa'}
                  emissive={activations[layerIndex]?.[nodeIndex] ? '#00aaff' : '#888888'}
                  emissiveIntensity={activations[layerIndex]?.[nodeIndex] ? 0.8 : 0.2}
                />
              </mesh>
            </Interactive>
          ))}
        </React.Fragment>
      ))}
      
      {/* Connections */}
      {connectionPaths.map((layerPaths, layerIndex) => (
        <React.Fragment key={`connections-${layerIndex}`}>
          {layerPaths.map((connection, connectionIndex) => {
            // Create points for cubic bezier curve
            const { start, end } = connection;
            
            // Control points for curve
            const ctrl1 = [
              start[0] + (end[0] - start[0]) * 0.3,
              start[1],
              start[2]
            ];
            
            const ctrl2 = [
              start[0] + (end[0] - start[0]) * 0.7,
              end[1],
              end[2]
            ];
            
            // Create curve path
            const curve = new THREE.CubicBezierCurve3(
              new THREE.Vector3(...start),
              new THREE.Vector3(...ctrl1),
              new THREE.Vector3(...ctrl2),
              new THREE.Vector3(...end)
            );
            
            const curvePoints = curve.getPoints(20);
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
            
            // Connection line
            return (
              <line
                key={`connection-${layerIndex}-${connectionIndex}`}
                geometry={lineGeometry}
                ref={(el) => {
                  if (!connectionRefs.current[layerIndex]) connectionRefs.current[layerIndex] = [];
                  connectionRefs.current[layerIndex][connectionIndex] = el;
                }}
              >
                <lineBasicMaterial
                  color="#aaaaaa"
                  transparent
                  opacity={0.2}
                />
              </line>
            );
          })}
        </React.Fragment>
      ))}
      
      {/* Signal pulses traveling along connections */}
      {connectionSignals.map((layerSignals, layerIndex) => (
        <React.Fragment key={`signals-${layerIndex}`}>
          {layerSignals.map((signal, connectionIndex) => {
            if (!signal.active) return null;
            
            const connection = connectionPaths[layerIndex][connectionIndex];
            const { start, end } = connection;
            
            // Control points for curve (same as for the connection line)
            const ctrl1 = [
              start[0] + (end[0] - start[0]) * 0.3,
              start[1],
              start[2]
            ];
            
            const ctrl2 = [
              start[0] + (end[0] - start[0]) * 0.7,
              end[1],
              end[2]
            ];
            
            // Create curve path
            const curve = new THREE.CubicBezierCurve3(
              new THREE.Vector3(...start),
              new THREE.Vector3(...ctrl1),
              new THREE.Vector3(...ctrl2),
              new THREE.Vector3(...end)
            );
            
            // Get position along curve based on progress
            const position = curve.getPoint(signal.progress);
            
            // Signal pulse
            return (
              <mesh
                key={`signal-${layerIndex}-${connectionIndex}`}
                position={[position.x, position.y, position.z]}
              >
                <sphereGeometry args={[0.08 * scale, 8, 8]} />
                <meshBasicMaterial
                  color="#ffffff"
                  emissive="#00aaff"
                  emissiveIntensity={1}
                />
              </mesh>
            );
          })}
        </React.Fragment>
      ))}
      
      {/* Instructions for VR */}
      {isPresenting && (
        <mesh position={[0, -2, 0]}>
          <planeGeometry args={[4, 0.5]} />
          <meshBasicMaterial color="#000000" opacity={0.7} transparent />
          <mesh position={[0, 0, 0.01]}>
            <textGeometry
              args={["Tap on input nodes (left) to activate the network", { font: undefined, size: 0.1, height: 0.01 }]}
            />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>
      )}
      
      {/* Ambient light and point light for better visualization */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 2, 3]} intensity={0.8} />
    </group>
  );
};
