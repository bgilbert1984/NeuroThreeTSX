import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR, Interactive } from '@react-three/xr';
import * as THREE from 'three';
import * as d3 from 'd3';
import { VisualizationProps } from '../../types';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  value: number;
  x?: number;
  y?: number;
  z?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: Node;
  target: Node;
  value: number;
}

interface ControllerState {
  isConnected: boolean;
  buttonPressed: boolean;
}

export const NetworkVisualizationXR: React.FC<VisualizationProps> = ({ 
  position = [0, 0, 0], 
  scale = 1,
  onNodeSelected = (nodeId: string) => {} 
}) => {
  const { isPresenting } = useXR();
  const nodesRef = useRef<THREE.Points>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [controllerState, setControllerState] = useState<ControllerState>({
    isConnected: false,
    buttonPressed: false
  });
  
  // Handle node selection with feedback to parent
  const handleNodeSelect = (nodeId: string): void => {
    const newSelection = nodeId === selectedNode ? null : nodeId;
    setSelectedNode(newSelection);
    onNodeSelected(newSelection || '');
  };

  // Generate network data
  const { nodes, links, simulation } = useMemo(() => {
    const nodeCount = isPresenting ? 30 : 50;
    const nodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node-${i}`,
      group: Math.floor(Math.random() * 5),
      value: Math.random(),
    }));

    const links: Link[] = [];
    nodes.forEach((node, i) => {
      const numLinks = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numLinks; j++) {
        const targetIndex = Math.floor(Math.random() * nodes.length);
        if (targetIndex !== i) {
          links.push({
            source: node,
            target: nodes[targetIndex],
            value: Math.random(),
          });
        }
      }
    });

    // Create force simulation
    const simulation = d3.forceSimulation<Node, Link>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-30))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(0.5));
      
    // Add third dimension to simulation
    simulation.force('z', d3.forceZ(0).strength(0.01));
    
    return { nodes, links, simulation };
  }, [isPresenting]);

  // Xbox controller support for node manipulation
  useEffect(() => {
    const handleGamepadConnected = (event) => {
      setControllerState(prev => ({ ...prev, isConnected: true }));
      console.log("Xbox controller connected:", event.gamepad);
    };
    
    const handleGamepadDisconnected = () => {
      setControllerState(prev => ({ ...prev, isConnected: false }));
    };
    
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);
    
    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

  // Update positions in animation loop and handle controller input
  useFrame(() => {
    if (!nodesRef.current || !edgesRef.current) return;

    // Process Xbox controller input
    const gamepads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
    const xboxController = gamepads.find(gamepad => 
      gamepad && (gamepad.id.includes('Xbox') || gamepad.mapping === 'standard')
    );
    
    if (xboxController) {
      // Use right stick to manipulate the network (rotate/scale)
      const rightStickX = xboxController.axes[2]; // Right stick X
      const rightStickY = xboxController.axes[3]; // Right stick Y
      
      // Apply rotation to simulation based on right stick
      if (Math.abs(rightStickX) > 0.1) {
        nodes.forEach(node => {
          if (node.x !== undefined && node.z !== undefined) {
            // Rotate around Y axis
            const x = node.x;
            const z = node.z;
            node.x = x * Math.cos(rightStickX * 0.05) - z * Math.sin(rightStickX * 0.05);
            node.z = x * Math.sin(rightStickX * 0.05) + z * Math.cos(rightStickX * 0.05);
          }
        });
      }
      
      // Scale simulation based on triggers
      const rightTrigger = xboxController.buttons[7]?.value || 0; // RT
      const leftTrigger = xboxController.buttons[6]?.value || 0; // LT
      
      if (rightTrigger > 0.1 || leftTrigger > 0.1) {
        const scaleFactor = 1 + (rightTrigger - leftTrigger) * 0.02;
        nodes.forEach(node => {
          if (node.x !== undefined && node.y !== undefined && node.z !== undefined) {
            node.x *= scaleFactor;
            node.y *= scaleFactor;
            node.z *= scaleFactor;
          }
        });
      }
      
      // A button to select nearest node
      const aButtonPressed = xboxController.buttons[0]?.pressed;
      if (aButtonPressed && !controllerState.buttonPressed) {
        // Find nearest node to controller
        // In a real implementation, you would use the controller position
        // For this example, we'll just select a random node
        const randomNodeIndex = Math.floor(Math.random() * nodes.length);
        handleNodeSelect(nodes[randomNodeIndex].id);
      }
      
      setControllerState(prev => ({ 
        ...prev, 
        buttonPressed: aButtonPressed 
      }));
    }

    simulation.tick();

    // Update node positions
    const nodePositions = nodesRef.current.geometry.attributes.position;
    const nodeColors = nodesRef.current.geometry.attributes.color;

    nodes.forEach((node, i) => {
      if (node.x !== undefined && node.y !== undefined) {
        nodePositions.setXYZ(
          i,
          node.x * scale,
          node.y * scale,
          (node.z || 0) * scale
        );

        const color = new THREE.Color().setHSL(
          node.group / 5,
          0.8,
          selectedNode === node.id ? 0.8 : 0.5
        );
        nodeColors.setXYZ(i, color.r, color.g, color.b);
      }
    });

    nodePositions.needsUpdate = true;
    nodeColors.needsUpdate = true;

    // Update edge positions
    const edgePositions = edgesRef.current.geometry.attributes.position;
    const edgeColors = edgesRef.current.geometry.attributes.color;

    links.forEach((link, i) => {
      const sourceNode = link.source as Node;
      const targetNode = link.target as Node;

      if (sourceNode.x !== undefined && sourceNode.y !== undefined &&
          targetNode.x !== undefined && targetNode.y !== undefined) {
        edgePositions.setXYZ(i * 2,
          sourceNode.x * scale,
          sourceNode.y * scale,
          (sourceNode.z || 0) * scale
        );
        edgePositions.setXYZ(i * 2 + 1,
          targetNode.x * scale,
          targetNode.y * scale,
          (targetNode.z || 0) * scale
        );

        const color = new THREE.Color().setHSL(
          (sourceNode.group + targetNode.group) / 10,
          0.6,
          selectedNode === sourceNode.id || selectedNode === targetNode.id ? 0.6 : 0.3
        );
        edgeColors.setXYZ(i * 2, color.r, color.g, color.b);
        edgeColors.setXYZ(i * 2 + 1, color.r, color.g, color.b);
      }
    });

    edgePositions.needsUpdate = true;
    edgeColors.needsUpdate = true;
  });

  return (
    <group position={position}>
      {/* Edges */}
      <lineSegments ref={edgesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={links.length * 2}
            array={new Float32Array(links.length * 6)}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={links.length * 2}
            array={new Float32Array(links.length * 6)}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </lineSegments>

      {/* Nodes */}
      <points ref={nodesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nodes.length}
            array={new Float32Array(nodes.length * 3)}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={nodes.length}
            array={new Float32Array(nodes.length * 3)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.2 * scale}
          vertexColors
          sizeAttenuation
          transparent
          depthWrite={false}
        />
      </points>

      {/* Node interaction spheres */}
      {isPresenting && nodes.map((node, i) => (
        <Interactive
          key={node.id}
          onSelect={() => handleNodeSelect(node.id)}
        >
          <mesh
            position={[
              (node.x || 0) * scale,
              (node.y || 0) * scale,
              (node.z || 0) * scale
            ]}
          >
            <sphereGeometry args={[0.1 * scale, 8, 8]} />
            <meshBasicMaterial
              transparent
              opacity={0}
            />
          </mesh>
        </Interactive>
      ))}

      {/* Selected node info */}
      {selectedNode && (
        <mesh
          position={[
            ((nodes.find(n => n.id === selectedNode)?.x || 0) + 0.3) * scale,
            ((nodes.find(n => n.id === selectedNode)?.y || 0) + 0.3) * scale,
            ((nodes.find(n => n.id === selectedNode)?.z || 0)) * scale
          ]}
        >
          <planeGeometry args={[0.6, 0.2]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
          {/* Add text label here */}
          <mesh position={[0, 0, 0.01]}>
            <textGeometry args={[selectedNode, { size: 0.05, height: 0.01 }]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </mesh>
      )}
      
      {/* Controller status indicator (helpful for debugging) */}
      {controllerState.isConnected && (
        <mesh position={[-1.5 * scale, -1 * scale, 0]}>
          <planeGeometry args={[0.8, 0.2]} />
          <meshBasicMaterial color="green" />
          <mesh position={[0, 0, 0.01]}>
            <textGeometry args={["Controller Connected", { size: 0.04, height: 0.01 }]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </mesh>
      )}
    </group>
  );
};
