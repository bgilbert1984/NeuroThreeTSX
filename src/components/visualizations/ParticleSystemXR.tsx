import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';
import { VisualizationProps } from '../../types';

interface ParticleAttributes {
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
}

export const ParticleSystemXR: React.FC<VisualizationProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  const { isPresenting } = useXR();
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate particles
  const { positions, colors, particles } = useMemo(() => {
    const particleCount = isPresenting ? 5000 : 10000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const particles: ParticleAttributes[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );
      
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
      
      const color = new THREE.Color().setHSL(
        Math.random(),
        0.8,
        0.5 + Math.random() * 0.5
      );
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      particles.push({
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        acceleration: new THREE.Vector3(),
        color,
        size: (0.5 + Math.random() * 0.5) * scale,
        life: Math.random(),
        maxLife: 0.5 + Math.random() * 2
      });
    }
    
    return { positions, colors, particles };
  }, [isPresenting, scale]);
  
  // Animation loop
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position;
    const colors = pointsRef.current.geometry.attributes.color;
    
    particles.forEach((particle, i) => {
      // Update life
      particle.life += delta;
      if (particle.life > particle.maxLife) {
        particle.life = 0;
        // Reset position
        const pos = new THREE.Vector3(
          positions.getX(i),
          positions.getY(i),
          positions.getZ(i)
        );
        pos.set(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );
        positions.setXYZ(i, pos.x, pos.y, pos.z);
      }
      
      // Update velocity and position
      particle.velocity.add(particle.acceleration.multiplyScalar(delta));
      const pos = new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );
      pos.add(particle.velocity);
      
      // Boundary check
      if (Math.abs(pos.x) > 1) particle.velocity.x *= -1;
      if (Math.abs(pos.y) > 1) particle.velocity.y *= -1;
      if (Math.abs(pos.z) > 1) particle.velocity.z *= -1;
      
      positions.setXYZ(i, pos.x, pos.y, pos.z);
      
      // Update color based on velocity
      const speed = particle.velocity.length();
      particle.color.setHSL(
        (speed * 10) % 1,
        0.8,
        0.5 + (speed * 5)
      );
      colors.setXYZ(i, particle.color.r, particle.color.g, particle.color.b);
    });
    
    positions.needsUpdate = true;
    colors.needsUpdate = true;
  });
  
  return (
    <points ref={pointsRef} position={position} scale={scale}>
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
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        onBeforeCompile={(shader: THREE.Shader) => {
          shader.vertexShader = shader.vertexShader.replace(
            'gl_PointSize = size;',
            'gl_PointSize = size * (300.0 / -mvPosition.z);'
          );
        }}
      />
    </points>
  );
};