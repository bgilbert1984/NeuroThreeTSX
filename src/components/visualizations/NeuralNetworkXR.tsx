import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Interactive, useXR } from '@react-three/xr';
import * as THREE from 'three';
import { VisualizationProps } from '../../types';

interface Neuron {
  position: THREE.Vector3;
  activation: number;
  layer: number;
  index: number;
}

interface Connection {
  source: Neuron;
  target: Neuron;
  weight: number;
  signal: number;
}

const NeuralNetworkXR: React.FC<VisualizationProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  const { isPresenting } = useXR();
  const neuronsRef = useRef<THREE.Points>(null);
  const connectionsRef = useRef<THREE.LineSegments>(null);

  // Generate neural network structure
  const { neurons, connections, neuronPositions, neuronColors, connectionPositions, connectionColors } = useMemo(() => {
    const layers = [4, 6, 6, 4];
    const neurons: Neuron[] = [];
    const connections: Connection[] = [];
    const layerSpacing = 2 * scale;
    const neuronSpacing = 1 * scale;

    // Create neurons
    layers.forEach((layerSize, layerIndex) => {
      const layerOffset = (layerIndex - (layers.length - 1) / 2) * layerSpacing;
      const verticalOffset = (layerSize - 1) * neuronSpacing / 2;

      for (let i = 0; i < layerSize; i++) {
        neurons.push({
          position: new THREE.Vector3(
            layerOffset,
            i * neuronSpacing - verticalOffset,
            0
          ),
          activation: 0,
          layer: layerIndex,
          index: i
        });
      }
    });

    // Create connections
    for (let i = 0; i < layers.length - 1; i++) {
      const sourceLayer = neurons.filter(n => n.layer === i);
      const targetLayer = neurons.filter(n => n.layer === i + 1);

      sourceLayer.forEach(source => {
        targetLayer.forEach(target => {
          connections.push({
            source,
            target,
            weight: Math.random() * 2 - 1,
            signal: 0
          });
        });
      });
    }

    // Create geometry attributes
    const neuronPositions = new Float32Array(neurons.length * 3);
    const neuronColors = new Float32Array(neurons.length * 3);
    const connectionPositions = new Float32Array(connections.length * 6);
    const connectionColors = new Float32Array(connections.length * 6);

    neurons.forEach((neuron, i) => {
      neuronPositions[i * 3] = neuron.position.x;
      neuronPositions[i * 3 + 1] = neuron.position.y;
      neuronPositions[i * 3 + 2] = neuron.position.z;

      const color = new THREE.Color().setHSL(
        neuron.layer / layers.length,
        0.8,
        0.5
      );
      neuronColors[i * 3] = color.r;
      neuronColors[i * 3 + 1] = color.g;
      neuronColors[i * 3 + 2] = color.b;
    });

    connections.forEach((connection, i) => {
      connectionPositions[i * 6] = connection.source.position.x;
      connectionPositions[i * 6 + 1] = connection.source.position.y;
      connectionPositions[i * 6 + 2] = connection.source.position.z;
      connectionPositions[i * 6 + 3] = connection.target.position.x;
      connectionPositions[i * 6 + 4] = connection.target.position.y;
      connectionPositions[i * 6 + 5] = connection.target.position.z;

      const color = new THREE.Color().setHSL(
        (connection.weight + 1) / 2,
        0.8,
        0.5
      );
      connectionColors[i * 6] = color.r;
      connectionColors[i * 6 + 1] = color.g;
      connectionColors[i * 6 + 2] = color.b;
      connectionColors[i * 6 + 3] = color.r;
      connectionColors[i * 6 + 4] = color.g;
      connectionColors[i * 6 + 5] = color.b;
    });

    return { neurons, connections, neuronPositions, neuronColors, connectionPositions, connectionColors };
  }, [scale]);

  // Handle neuron activation
  const activateNeuron = (neuron: Neuron): void => {
    neuron.activation = 1;
    const outgoingConnections = connections.filter(c => c.source === neuron);
    outgoingConnections.forEach(connection => {
      connection.signal = 1;
    });
  };

  // Animation loop
  useFrame((_, delta) => {
    if (!neuronsRef.current || !connectionsRef.current) return;

    // Update neuron activations
    neurons.forEach((neuron, i) => {
      if (neuron.activation > 0) {
        neuron.activation = Math.max(0, neuron.activation - delta);
        const colors = neuronsRef.current!.geometry.attributes.color;
        const color = new THREE.Color().setHSL(
          neuron.layer / neurons.length,
          0.8,
          0.5 + neuron.activation * 0.5
        );
        colors.setXYZ(i, color.r, color.g, color.b);
        colors.needsUpdate = true;
      }
    });

    // Update connection signals
    connections.forEach((connection, i) => {
      if (connection.signal > 0) {
        connection.signal = Math.max(0, connection.signal - delta);
        const colors = connectionsRef.current!.geometry.attributes.color;
        const color = new THREE.Color().setHSL(
          (connection.weight + 1) / 2,
          0.8,
          0.5 + connection.signal * 0.5
        );
        colors.setXYZ(i * 2, color.r, color.g, color.b);
        colors.setXYZ(i * 2 + 1, color.r, color.g, color.b);
        colors.needsUpdate = true;

        // Propagate signal to target neuron
        if (connection.signal < 0.1 && connection.target.activation === 0) {
          activateNeuron(connection.target);
        }
      }
    });
  });

  return (
    <group position={position}>
      {/* Connections */}
      <lineSegments ref={connectionsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connectionPositions.length / 3}
            array={connectionPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={connectionColors.length / 3}
            array={connectionColors}
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

      {/* Neurons */}
      <points ref={neuronsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={neuronPositions.length / 3}
            array={neuronPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={neuronColors.length / 3}
            array={neuronColors}
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

      {/* Neuron interaction spheres */}
      {isPresenting && neurons.map((neuron) => (
        <Interactive
          key={`${neuron.layer}-${neuron.index}`}
          onSelect={() => activateNeuron(neuron)}
        >
          <mesh position={neuron.position}>
            <sphereGeometry args={[0.1 * scale, 8, 8]} />
            <meshBasicMaterial
              transparent
              opacity={0}
            />
          </mesh>
        </Interactive>
      ))}
    </group>
  );
};

export { NeuralNetworkXR };
