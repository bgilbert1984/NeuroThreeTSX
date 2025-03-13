import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CloudPoint {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
}

const PortfolioEnvironment: React.FC = () => {
  const floorRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Group>(null);

  // Generate cloud points
  const cloudPoints: CloudPoint[] = Array.from({ length: 20 }, () => ({
    position: new THREE.Vector3(
      (Math.random() - 0.5) * 40,
      10 + Math.random() * 5,
      (Math.random() - 0.5) * 40
    ),
    rotation: new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    ),
    scale: 1 + Math.random() * 2
  }));

  // Animate clouds
  useFrame((_, delta: number) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.02;
      
      cloudsRef.current.children.forEach((cloud, i) => {
        cloud.rotation.x += delta * 0.1 * (i % 2 ? 1 : -1);
        cloud.rotation.z += delta * 0.1 * (i % 2 ? -1 : 1);
      });
    }
  });

  return (
    <group>
      {/* Floor grid */}
      <mesh 
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.001, 0]}
      >
        <planeGeometry args={[100, 100, 100, 100]} />
        <meshStandardMaterial 
          color="#666666"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Clouds */}
      <group ref={cloudsRef}>
        {cloudPoints.map((point, i) => (
          <mesh
            key={i}
            position={point.position}
            rotation={point.rotation}
            scale={point.scale}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.2}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      
      {/* Directional light for shadows */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-10, 10, 10, -10, 0.1, 50]}
        />
      </directionalLight>

      {/* Additional point lights for ambiance */}
      <pointLight position={[-10, 5, -10]} intensity={0.3} color="#4466ff" />
      <pointLight position={[10, 5, 10]} intensity={0.3} color="#ff4466" />
    </group>
  );
};

export { PortfolioEnvironment };
