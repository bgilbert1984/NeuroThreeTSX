import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';

export const ParticleSystemXR = ({ position = [0, 0, 0], scale = 1 }) => {
  const { isPresenting } = useXR();
  const ref = useRef();
  
  // Reduce particle count in VR for performance
  const particleCount = isPresenting ? 5000 : 20000;
  
  // Create particles with computed positions, sizes, and colors
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      
      // Calibrate scale for XR viewing
      const adjustedXFactor = xFactor * scale;
      const adjustedYFactor = yFactor * scale;
      const adjustedZFactor = zFactor * scale;
      
      temp.push({
        t,
        factor,
        speed,
        xFactor: adjustedXFactor,
        yFactor: adjustedYFactor,
        zFactor: adjustedZFactor,
        mx: 0,
        my: 0
      });
    }
    return temp;
  }, [particleCount, scale]);
  
  // Create geometry and material
  const [geo, mat, dummy] = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.05, 10, 10);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#5786F5"),
      roughness: 0.5,
      metalness: 0.8,
      emissive: new THREE.Color("#000222")
    });
    return [geo, mat, new THREE.Object3D()];
  }, []);
  
  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    
    // Animate each particle
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      
      // Update timing factors
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.max(1.5, Math.cos(t));
      
      // Set the instance position
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      
      // Prevent particles from going too far in VR
      if (isPresenting) {
        dummy.position.x = THREE.MathUtils.clamp(dummy.position.x, -10, 10);
        dummy.position.y = THREE.MathUtils.clamp(dummy.position.y, -10, 10);
        dummy.position.z = THREE.MathUtils.clamp(dummy.position.z, -10, 10);
      }
      
      // Set the instance scale and rotation
      dummy.scale.set(s * 0.3, s * 0.3, s * 0.3);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      
      // Apply the matrix at the right position
      mesh.setMatrixAt(i, dummy.matrix);
    });
    
    // Update the instance matrices
    mesh.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <group position={position}>
      <pointLight distance={40} intensity={isPresenting ? 4 : 8} color="#F8C069">
        <mesh scale={[0.5, 0.5, 3]}>
          <dodecahedronGeometry args={[1.5 * scale, 0]} />
          <meshBasicMaterial color="#F8C069" />
        </mesh>
      </pointLight>
      
      <instancedMesh ref={ref} args={[geo, mat, particleCount]}>
        <sphereGeometry args={[0.1 * scale, 10, 10]} />
        <meshStandardMaterial 
          color="#A0C5FF" 
          roughness={0.5}
          emissive="#003380"
          emissiveIntensity={0.5}
        />
      </instancedMesh>
    </group>
  );
};