// src/components/GemmaScene.tsx
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface GemmaSceneProps {
  geometry?: THREE.BufferGeometry; // Allow a geometry to be passed in
  material?: THREE.Material;     // Allow a material to be passed in
}

const GemmaScene: React.FC<GemmaSceneProps> = ({ geometry, material }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // Use provided geometry and material, or defaults
  const defaultGeometry = new THREE.BoxGeometry(1, 1, 1);
  const defaultMaterial = new THREE.MeshStandardMaterial({ color: 'purple' });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh ref={meshRef} geometry={geometry || defaultGeometry} material={material || defaultMaterial} />
      <OrbitControls />
    </>
  );
};

export default GemmaScene;