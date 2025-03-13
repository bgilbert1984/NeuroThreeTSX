import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR, Interactive } from '@react-three/xr';
import * as THREE from 'three';

export const NetworkVisualizationXR = ({ position = [0, 0, 0], scale = 1 }) => {
  const { isPresenting } = useXR();
  const groupRef = useRef();
  const nodesRef = useRef([]);
  const linesRef = useRef([]);
  
  // Network properties
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  
  // Optimize network size for XR
  const nodeCount = isPresenting ? 15 : 30;
  
  // Create network data
  useEffect(() => {
    const newNodes = [];
    const newConnections = [];
    
    // Create nodes in a spherical arrangement
    for (let i = 0; i < nodeCount; i++) {
      // Calculate position on a sphere
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      
      // Convert to cartesian coordinates
      const x = Math.cos(theta) * Math.sin(phi) * (2 * scale);
      const y = Math.sin(theta) * Math.sin(phi) * (2 * scale);
      const z = Math.cos(phi) * (2 * scale);
      
      // Add node with random properties
      newNodes.push({
        id: i,
        position: [x, y, z],
        size: 0.1 + Math.random() * 0.1,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        value: Math.random()
      });
    }
    
    // Create connections between nodes (not all nodes connected)
    for (let i = 0; i < nodeCount; i++) {
      const connectionsPerNode = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < connectionsPerNode; j++) {
        // Find a target node (not self)
        let targetIndex;
        do {
          targetIndex = Math.floor(Math.random() * nodeCount);
        } while (targetIndex === i);
        
        newConnections.push({
          id: `${i}-${targetIndex}`,
          source: i,
          target: targetIndex,
          strength: Math.random() * 0.8 + 0.2
        });
      }
    }
    
    setNodes(newNodes);
    setConnections(newConnections);
  }, [nodeCount, scale]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Slowly rotate the entire network
      groupRef.current.rotation.y += delta * 0.1;
      
      // Add slight pulsing effect to all nodes
      nodesRef.current.forEach((mesh, i) => {
        if (!mesh) return;
        
        // Nodes pulse subtly
        const pulseSpeed = 0.5 + nodes[i].value * 0.5;
        const pulse = Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.1 + 1;
        mesh.scale.set(pulse, pulse, pulse);
        
        // Active node pulses more dramatically
        if (activeNode === i) {
          const activePulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 1.3;
          mesh.scale.set(activePulse, activePulse, activePulse);
        }
      });
      
      // Animate connections too
      linesRef.current.forEach((line, i) => {
        if (!line) return;
        const connection = connections[i];
        
        // If connected to active node, highlight the connection
        const isActive = activeNode !== null && 
          (connection.source === activeNode || connection.target === activeNode);
        
        if (line.material) {
          // Pulse the opacity
          const basePulse = Math.sin(state.clock.elapsedTime + i) * 0.2 + 0.8;
          line.material.opacity = isActive ? 0.9 : (basePulse * 0.5);
          
          // Change color if active
          if (isActive && line.material.color) {
            line.material.color.set('#ffffff');
          } else if (line.material.color) {
            // Original color based on connection strength
            const hue = 200 + connection.strength * 160; // Blue to purple
            line.material.color.setHSL(hue/360, 0.8, 0.5);
          }
        }
      });
    }
  });
  
  // Handle node click/select in VR
  const handleNodeSelect = (index) => {
    setActiveNode(activeNode === index ? null : index);
  };
  
  return (
    <group position={position} ref={groupRef}>
      {/* Network nodes */}
      {nodes.map((node, index) => (
        <React.Fragment key={node.id}>
          <Interactive onSelect={() => handleNodeSelect(index)}>
            <mesh
              position={node.position}
              ref={(el) => (nodesRef.current[index] = el)}
            >
              <sphereGeometry args={[node.size, 16, 16]} />
              <meshStandardMaterial
                color={node.color}
                emissive={node.color}
                emissiveIntensity={activeNode === index ? 0.5 : 0.2}
                toneMapped={false}
              />
            </mesh>
          </Interactive>
        </React.Fragment>
      ))}
      
      {/* Network connections */}
      {connections.map((connection, index) => {
        if (!nodes[connection.source] || !nodes[connection.target]) return null;
        
        const start = nodes[connection.source].position;
        const end = nodes[connection.target].position;
        
        // Calculate points for a curved line
        const points = [];
        const segments = 20;
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          // Add slight curve using midpoint displacement
          const midPoint = new THREE.Vector3(
            start[0] + (end[0] - start[0]) * t,
            start[1] + (end[1] - start[1]) * t,
            start[2] + (end[2] - start[2]) * t
          );
          
          // Add curvature at midpoint
          if (t > 0.25 && t < 0.75) {
            const bulge = 0.2 * Math.sin(Math.PI * t);
            const direction = new THREE.Vector3().subVectors(
              new THREE.Vector3(end[0], end[1], end[2]),
              new THREE.Vector3(start[0], start[1], start[2])
            ).normalize();
            const perpendicular = new THREE.Vector3(direction.z, direction.y, -direction.x);
            
            midPoint.add(perpendicular.multiplyScalar(bulge));
          }
          
          points.push(midPoint);
        }
        
        // Create curved line from points
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        
        return (
          <line key={connection.id} geometry={lineGeometry} ref={(el) => (linesRef.current[index] = el)}>
            <lineBasicMaterial 
              color={`hsl(${200 + connection.strength * 160}, 80%, 50%)`}
              transparent
              opacity={0.5}
              linewidth={isPresenting ? 3 : 1} // Thicker lines in VR
            />
          </line>
        );
      })}
      
      {/* Add subtle ambient light to the network */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="white" />
    </group>
  );
};
