import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR, useController, Interactive } from '@react-three/xr';
import * as THREE from 'three';

export const TerrainMappingXR = ({ position = [0, 0, 0], scale = 1 }) => {
  const { isPresenting } = useXR();
  const terrainRef = useRef();
  const scanBarRef = useRef();
  const dataPointsRef = useRef();
  
  const [scanProgress, setScanProgress] = useState(0);
  const [terrainType, setTerrainType] = useState('mountains');
  const [interactMode, setInteractMode] = useState(false);
  
  // XR controller for interaction
  const rightController = useController('right');
  
  // Adjust resolution based on VR mode for performance
  const resolution = isPresenting ? 32 : 64;
  const range = 5 * scale;
  const scanSpeed = 0.5;
  const heightScale = 1.5 * scale;
  
  // Generate height data based on terrain type
  const { heightData, positions, colors } = useMemo(() => {
    const res = resolution;
    const heightData = new Float32Array(res * res);
    
    // Generate different noise patterns based on the terrain type
    let noiseScale = 0.1;
    let noiseHeight = 1.0;
    let noiseBaseline = 0;
    
    switch (terrainType) {
      case 'mountains':
        noiseScale = 0.15;
        noiseHeight = 1.0;
        noiseBaseline = 0;
        break;
      case 'canyon':
        noiseScale = 0.08;
        noiseHeight = 1.2;
        noiseBaseline = -0.5;
        break;
      case 'coastal':
        noiseScale = 0.12;
        noiseHeight = 0.6;
        noiseBaseline = -0.3;
        break;
      case 'urban':
        noiseScale = 0.3;
        noiseHeight = 0.5;
        noiseBaseline = 0;
        break;
      default:
        // Default to mountains
        noiseScale = 0.15;
        noiseHeight = 1.0;
        noiseBaseline = 0;
    }
    
    // Simple noise function for height generation
    const noise = (nx, ny) => {
      // Simple implementation of Perlin-like noise
      const sin0 = Math.sin(nx * 1.0) * 0.5 + 0.5;
      const sin1 = Math.sin(ny * 1.0) * 0.5 + 0.5;
      const sin2 = Math.sin((nx + ny) * 2.0) * 0.5 + 0.5;
      const sin3 = Math.sin(Math.sqrt(nx * nx + ny * ny) * 5.0) * 0.5 + 0.5;
      
      let n = sin0 * 0.25 + sin1 * 0.25 + sin2 * 0.25 + sin3 * 0.25;
      
      // Add some variations based on terrain type
      if (terrainType === 'mountains') {
        // Add sharper peaks
        n = Math.pow(n, 0.8);
      } else if (terrainType === 'canyon') {
        // Create deeper valleys
        n = n < 0.4 ? n * 0.5 : n;
      } else if (terrainType === 'coastal') {
        // Create flatter areas at the bottom
        n = n < 0.3 ? 0.3 : n;
      } else if (terrainType === 'urban') {
        // Create plateaus and sudden height changes
        n = Math.floor(n * 5) / 5;
      }
      
      return n;
    };
    
    // Generate the height data
    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const nx = i / res - 0.5;
        const ny = j / res - 0.5;
        
        const n1 = noise(nx * 5, ny * 5);
        const n2 = noise(nx * 10, ny * 10) * 0.5;
        const n3 = noise(nx * 20, ny * 20) * 0.25;
        
        let height = (n1 + n2 + n3) * noiseHeight + noiseBaseline;
        
        // Ensure some flat areas for urban environments
        if (terrainType === 'urban' && Math.random() > 0.7) {
          height = Math.floor(height * 3) / 3;
        }
        
        heightData[i * res + j] = height;
      }
    }
    
    // Create data points for radar scan visualization
    const pointCount = res * 4; // Fewer points than full resolution for visual clarity
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);
    
    for (let i = 0; i < pointCount; i++) {
      const x = (Math.random() - 0.5) * range;
      const z = (Math.random() - 0.5) * range;
      
      // Calculate height at this position by sampling the height data
      const gridX = Math.floor((x / range + 0.5) * (res - 1));
      const gridZ = Math.floor((z / range + 0.5) * (res - 1));
      const idx = Math.min(res - 1, Math.max(0, gridX)) * res + Math.min(res - 1, Math.max(0, gridZ));
      const y = heightData[idx] * heightScale;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y + 0.05; // Slightly above terrain
      positions[i * 3 + 2] = z;
      
      // Color based on height
      const heightColor = Math.max(0.2, Math.min((y + 1) / 2, 1));
      const hue = terrainType === 'mountains' ? 0.66 : 
                 terrainType === 'canyon' ? 0.05 :
                 terrainType === 'coastal' ? 0.55 : 
                 0.33; // urban = green
                 
      const color = new THREE.Color().setHSL(hue, 0.8, heightColor);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return { heightData, positions, colors };
  }, [resolution, range, terrainType, heightScale]);

  // Update animation
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const scanPos = ((time * scanSpeed) % 2) - 1; // -1 to 1, looping
    setScanProgress((scanPos + 1) / 2); // Convert to 0-1 range
    
    if (scanBarRef.current) {
      scanBarRef.current.position.z = scanPos * (range / 2);
    }
    
    if (dataPointsRef.current) {
      // Only show points that have been "scanned"
      const positions = dataPointsRef.current.geometry.attributes.position;
      const alphas = [];
      
      for (let i = 0; i < positions.count; i++) {
        const z = positions.getZ(i);
        const normalized = (z / (range/2) + 1) / 2; // Convert -range/2 to range/2 into 0-1
        
        // Points are visible if they've been scanned
        const alpha = normalized <= scanProgress ? 1 : 0;
        alphas.push(alpha);
      }
      
      // Update alpha attribute
      dataPointsRef.current.geometry.setAttribute(
        'alpha',
        new THREE.Float32BufferAttribute(alphas, 1)
      );
    }
    
    if (terrainRef.current) {
      const material = terrainRef.current.material;
      if (material.displacementMap) {
        // Update displacement map animation
        material.displacementScale = heightScale * (0.8 + Math.sin(time * 0.2) * 0.1);
      }
    }
    
    // Interact with VR controller
    if (isPresenting && rightController && interactMode) {
      // Use controller position to manipulate terrain
      const controllerPos = rightController.grip.position;
      
      // Map controller position to terrain coordinates
      const x = ((controllerPos.x - position[0]) / range + 0.5) * resolution;
      const z = ((controllerPos.z - position[2]) / range + 0.5) * resolution;
      
      // Only modify if controller is over the terrain
      if (x >= 0 && x < resolution && z >= 0 && z < resolution) {
        // Modify terrain based on controller's Y position
        const idx = Math.floor(x) * resolution + Math.floor(z);
        if (heightData[idx] !== undefined) {
          // Raise or lower terrain based on controller's Y position
          const targetHeight = (controllerPos.y - position[1]) / heightScale;
          heightData[idx] = THREE.MathUtils.lerp(heightData[idx], targetHeight, 0.1);
          
          // Update terrain geometry
          updateTerrainGeometry();
        }
      }
    }
  });
  
  // Update terrain based on height data
  const updateTerrainGeometry = () => {
    if (terrainRef.current) {
      const geometry = terrainRef.current.geometry;
      
      // Update vertices based on height data
      const positions = geometry.attributes.position.array;
      
      for (let i = 0; i < resolution + 1; i++) {
        for (let j = 0; j < resolution + 1; j++) {
          // Sample height data, with edge handling
          const sampleI = Math.min(resolution - 1, i);
          const sampleJ = Math.min(resolution - 1, j);
          const height = heightData[sampleI * resolution + sampleJ];
          
          const index = (i * (resolution + 1) + j) * 3 + 1; // Y component
          positions[index] = height * heightScale;
        }
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  };
  
  // XR interactions - toggle terrain type
  const handleToggleTerrain = () => {
    const terrainTypes = ['mountains', 'canyon', 'coastal', 'urban'];
    const currentIndex = terrainTypes.indexOf(terrainType);
    const nextIndex = (currentIndex + 1) % terrainTypes.length;
    setTerrainType(terrainTypes[nextIndex]);
  };
  
  // Toggle interaction mode
  const handleToggleInteract = () => {
    setInteractMode(!interactMode);
  };
  
  // Initialize terrain geometry
  useEffect(() => {
    updateTerrainGeometry();
  }, [heightData, heightScale, resolution]);
  
  return (
    <group position={position}>
      {/* Base terrain */}
      <mesh
        ref={terrainRef}
        rotation={[-Math.PI/2, 0, 0]}
      >
        <planeGeometry args={[range, range, resolution, resolution]} />
        <meshStandardMaterial
          color={terrainType === 'mountains' ? "#8791B8" : 
                terrainType === 'canyon' ? "#B85D3C" : 
                terrainType === 'coastal' ? "#6096B4" : 
                "#687D69"} // urban
          flatShading={true}
          wireframe={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Scanning bar visualization */}
      <mesh 
        ref={scanBarRef}
        position={[0, 0.5, 0]}
      >
        <boxGeometry args={[range, 0.1, 0.05]} />
        <meshStandardMaterial
          color="#00FFAA"
          transparent
          opacity={0.8}
          emissive="#00FFAA"
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Radar data points */}
      <points ref={dataPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-alpha"
            count={positions.length / 3}
            array={new Float32Array(positions.length / 3).fill(0)}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15 * scale}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          // Alpha attribute for fade-in effect
          onBeforeCompile={(shader) => {
            shader.vertexShader = shader.vertexShader.replace(
              'attribute vec3 position;',
              'attribute vec3 position;\nattribute float alpha;'
            );
            shader.vertexShader = shader.vertexShader.replace(
              '#include <common>',
              '#include <common>\nvarying float vAlpha;'
            );
            shader.vertexShader = shader.vertexShader.replace(
              '#include <begin_vertex>',
              '#include <begin_vertex>\nvAlpha = alpha;'
            );
            
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <common>',
              '#include <common>\nvarying float vAlpha;'
            );
            shader.fragmentShader = shader.fragmentShader.replace(
              'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
              'gl_FragColor = vec4( outgoingLight, diffuseColor.a * vAlpha );'
            );
          }}
        />
      </points>
      
      {/* XR UI controls */}
      {isPresenting && (
        <group position={[0, 1.2, 0]}>
          <Interactive onSelect={handleToggleTerrain}>
            <mesh position={[-0.5, 0, 0]}>
              <boxGeometry args={[0.2, 0.1, 0.05]} />
              <meshStandardMaterial color="#4488ff" />
            </mesh>
            <mesh position={[-0.5, 0, 0.1]} scale={0.5}>
              <textGeometry args={["Terrain", {font: undefined, size: 0.05, height: 0.01}]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </Interactive>
          
          <Interactive onSelect={handleToggleInteract}>
            <mesh position={[0.5, 0, 0]}>
              <boxGeometry args={[0.2, 0.1, 0.05]} />
              <meshStandardMaterial color={interactMode ? "#ff4488" : "#44ff88"} />
            </mesh>
            <mesh position={[0.5, 0, 0.1]} scale={0.5}>
              <textGeometry args={["Edit", {font: undefined, size: 0.05, height: 0.01}]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </Interactive>
        </group>
      )}
      
      {/* Add labels */}
      <mesh position={[range/2 + 0.2, 0.2, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[0.5, 0.2]} />
        <meshBasicMaterial color="#000000" opacity={0.7} transparent />
      </mesh>
      
      <mesh position={[range/2 + 0.25, 0.2, 0]} rotation={[0, -Math.PI/2, 0]}>
        <textGeometry 
          args={[`${terrainType.charAt(0).toUpperCase() + terrainType.slice(1)}`, 
                {font: undefined, size: 0.05, height: 0.01}]} 
        />
        <meshBasicMaterial color="white" />
      </mesh>
      
      {/* Progress indicator */}
      <mesh position={[0, heightScale + 0.5, range/2 + 0.2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1, 0.2]} />
        <meshBasicMaterial color="#000000" opacity={0.7} transparent />
      </mesh>
      
      <mesh position={[0, heightScale + 0.5, range/2 + 0.25]} rotation={[0, Math.PI, 0]}>
        <textGeometry 
          args={[`Scan: ${Math.floor(scanProgress * 100)}%`, 
                {font: undefined, size: 0.05, height: 0.01}]} 
        />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
};
