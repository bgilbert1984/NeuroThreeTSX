import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';

export const PortfolioEnvironment = () => {
  const { isPresenting } = useXR();
  const floorRef = useRef();
  const wallsRef = useRef();
  const pedastalsRef = useRef();
  const lightRefs = useRef([]);
  
  // Floor pattern
  const floorPattern = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = context.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#0a0a2a');
    gradient.addColorStop(1, '#1a1a4a');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    
    // Create grid pattern
    context.strokeStyle = '#4040a0';
    context.lineWidth = 1;
    
    // Vertical lines
    for (let i = 0; i <= 512; i += 32) {
      context.beginPath();
      context.moveTo(i, 0);
      context.lineTo(i, 512);
      context.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i <= 512; i += 32) {
      context.beginPath();
      context.moveTo(0, i);
      context.lineTo(512, i);
      context.stroke();
    }
    
    // Add some decorative circles
    context.strokeStyle = '#6060d0';
    context.lineWidth = 2;
    
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 20 + Math.random() * 60;
      
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.stroke();
      
      // Add inner circle
      context.beginPath();
      context.arc(x, y, radius * 0.7, 0, Math.PI * 2);
      context.stroke();
    }
    
    return canvas;
  }, []);
  
  // Create floor texture from the canvas
  const floorTexture = useMemo(() => {
    const texture = new THREE.CanvasTexture(floorPattern);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);
    return texture;
  }, [floorPattern]);
  
  // Wall pattern with tech lines
  const wallPattern = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    
    // Dark background
    context.fillStyle = '#05051a';
    context.fillRect(0, 0, 1024, 1024);
    
    // Add circuit-like patterns
    context.strokeStyle = '#304080';
    context.lineWidth = 2;
    
    // Create random circuit paths
    for (let i = 0; i < 30; i++) {
      const startX = Math.random() * 1024;
      const startY = Math.random() * 1024;
      
      context.beginPath();
      context.moveTo(startX, startY);
      
      let x = startX;
      let y = startY;
      
      // Create path with right angles
      for (let j = 0; j < 8; j++) {
        const direction = Math.floor(Math.random() * 4);
        const length = 30 + Math.random() * 100;
        
        switch (direction) {
          case 0: // Up
            y -= length;
            break;
          case 1: // Right
            x += length;
            break;
          case 2: // Down
            y += length;
            break;
          case 3: // Left
            x -= length;
            break;
        }
        
        context.lineTo(x, y);
      }
      
      context.stroke();
    }
    
    // Add nodes at intersections
    context.fillStyle = '#6080f0';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = 2 + Math.random() * 4;
      
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    
    return canvas;
  }, []);
  
  // Create wall texture from the canvas
  const wallTexture = useMemo(() => {
    const texture = new THREE.CanvasTexture(wallPattern);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 1);
    return texture;
  }, [wallPattern]);
  
  // Animation loop for environment effects
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Animate floor
    if (floorRef.current && floorRef.current.material.userData.shader) {
      floorRef.current.material.userData.shader.uniforms.time.value = time;
    }
    
    // Animate pedastals 
    if (pedastalsRef.current) {
      pedastalsRef.current.children.forEach((pedestal, index) => {
        // Subtle hovering effect
        pedestal.position.y = 0.5 + Math.sin(time * 0.5 + index) * 0.05;
        
        // Subtle rotation
        pedestal.rotation.y = Math.sin(time * 0.2 + index * 2) * 0.1;
      });
    }
    
    // Animate lights
    lightRefs.current.forEach((light, index) => {
      if (!light) return;
      
      // Calculate orbit position
      const radius = 8 + Math.sin(time * 0.2 + index) * 2;
      const angle = time * 0.2 + index * Math.PI / 3;
      
      light.position.x = Math.cos(angle) * radius;
      light.position.z = Math.sin(angle) * radius;
      
      // Adjust light intensity for pulsing effect
      light.intensity = 0.5 + Math.sin(time * 0.5 + index) * 0.2;
    });
  });
  
  // Set up environment elements
  return (
    <group>
      {/* Floor */}
      <mesh 
        ref={floorRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        receiveShadow
      >
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          map={floorTexture}
          roughness={0.8}
          metalness={0.2}
          color="#3030a0"
        />
      </mesh>
      
      {/* Walls */}
      <group ref={wallsRef}>
        {/* Back wall */}
        <mesh position={[0, 10, -20]} receiveShadow>
          <boxGeometry args={[40, 20, 0.2]} />
          <meshStandardMaterial
            map={wallTexture}
            roughness={0.7}
            metalness={0.3}
            color="#2020a0"
            emissive="#000030"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Left wall */}
        <mesh position={[-20, 10, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <boxGeometry args={[40, 20, 0.2]} />
          <meshStandardMaterial
            map={wallTexture}
            roughness={0.7}
            metalness={0.3}
            color="#2020a0"
            emissive="#000030"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Right wall */}
        <mesh position={[20, 10, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <boxGeometry args={[40, 20, 0.2]} />
          <meshStandardMaterial
            map={wallTexture}
            roughness={0.7}
            metalness={0.3}
            color="#2020a0"
            emissive="#000030"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
      
      {/* Pedastals for exhibits */}
      <group ref={pedastalsRef}>
        {[-4, -2, 0, 2, 4].map((x, index) => (
          <mesh key={`pedestal-${index}`} position={[x * 2, 0.5, -3]} castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.7, 1, 16]} />
            <meshStandardMaterial
              color="#4040c0"
              metalness={0.6}
              roughness={0.2}
              emissive="#2020a0"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
        
        {[1, 3].map((i, index) => (
          <mesh key={`back-pedestal-${index}`} position={[i * 4 - 6, 0.5, -6]} castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.7, 1, 16]} />
            <meshStandardMaterial
              color="#4040c0"
              metalness={0.6}
              roughness={0.2}
              emissive="#2020a0"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      
      {/* Main directional light */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Decorative point lights */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <pointLight
          key={`light-${i}`}
          position={[
            Math.cos(i * Math.PI / 3) * 8,
            2 + Math.sin(i * 0.5) * 1,
            Math.sin(i * Math.PI / 3) * 8
          ]}
          intensity={0.6}
          distance={15}
          color={i % 3 === 0 ? '#4040ff' : i % 3 === 1 ? '#40ffff' : '#ff40ff'}
          castShadow={isPresenting ? false : i < 3} // Limit shadow-casting lights in VR
          ref={(el) => (lightRefs.current[i] = el)}
        />
      ))}
      
      {/* Decorative floating elements */}
      {Array.from({ length: isPresenting ? 15 : 50 }).map((_, i) => {
        const size = 0.05 + Math.random() * 0.1;
        const x = Math.random() * 30 - 15;
        const y = 1 + Math.random() * 8;
        const z = Math.random() * 30 - 15;
        
        return (
          <mesh key={`float-${i}`} position={[x, y, z]}>
            <dodecahedronGeometry args={[size, 0]} />
            <meshLambertMaterial
              color={i % 2 === 0 ? '#4040ff' : '#40ffff'}
              emissive={i % 2 === 0 ? '#2020a0' : '#20a0a0'}
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
};
