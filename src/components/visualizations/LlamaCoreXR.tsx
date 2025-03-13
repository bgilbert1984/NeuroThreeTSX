import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';
import { VisualizationProps } from '../../types';

// XR-optimized version of LlamaCore component
export const LlamaCoreXR: React.FC<VisualizationProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [health, setHealth] = useState<number>(1);
  const particlesRef = useRef<THREE.Group>(null);
  const { isPresenting } = useXR();

  // Decrease health over time for the visual effect
  useEffect(() => {
    const intervalId = setInterval(() => {
      setHealth((prevHealth) => Math.max(0, prevHealth - 0.01));
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  // Reset health when VR mode is toggled
  useEffect(() => {
    setHealth(1);
  }, [isPresenting]);

  // Create particles for visual effect
  useEffect(() => {
    if (!particlesRef.current) return;
    
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const numParticles = isPresenting ? 2000 : 5000; // Reduce particles in VR for performance
    
    for (let i = 0; i < numParticles; i++) {
      const x = THREE.MathUtils.randFloatSpread(5) * scale;
      const y = THREE.MathUtils.randFloatSpread(5) * scale;
      const z = THREE.MathUtils.randFloatSpread(5) * scale;
      vertices.push(x, y, z);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({
      color: 0xff0000,
      size: 0.02 * scale,
      sizeAttenuation: true
    });
    
    const points = new THREE.Points(geometry, material);
    particlesRef.current.add(points);
    
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [scale, isPresenting]);

  // Animation loop
  useFrame((_, delta: number) => {
    if (groupRef.current) {
      // Rotate the model
      groupRef.current.rotation.y += delta * 0.5;
    }
    
    if (particlesRef.current) {
      // Rotate particles
      particlesRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group position={position}>
      <group ref={groupRef.current} scale={scale}>
        {/* Main Llama body */}
        <mesh castShadow receiveShadow>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial 
            color={new THREE.Color().lerpColors(
              new THREE.Color(1, 0, 0),
              new THREE.Color(0, 1, 0),
              health
            )}
            metalness={0.5}
            roughness={0.5}
            transparent={true}
            opacity={Math.max(0.3, health)}
          />
        </mesh>
        
        {/* Simple eyes */}
        <mesh position={[0.4, 0.4, 0.7]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        <mesh position={[-0.4, 0.4, 0.7]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Particle system container */}
        <group ref={particlesRef} />
        
        {/* Add lights specific to this model */}
        <pointLight position={[0, 2, 2]} intensity={0.5} color="white" />
      </group>
      
      {/* XR interaction hint */}
      {isPresenting && (
        <mesh position={[0, 1.5, 0]} scale={0.2}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
      )}
    </group>
  );
};
