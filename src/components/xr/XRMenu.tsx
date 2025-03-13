import React, { useState } from 'react';
import { Interactive, useXR } from '@react-three/xr';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Menu locations for teleportation
const LOCATIONS = [
  { name: 'Entrance', position: [0, 0, 5] },
  { name: 'LlamaCore', position: [-4, 0, -3] },
  { name: 'Particles', position: [0, 0, -3] },
  { name: 'Network', position: [4, 0, -3] },
  { name: 'Terrain', position: [-4, 0, -6] },
  { name: 'Neural Network', position: [4, 0, -6] },
];

const XRMenu = ({ onTeleport }) => {
  const { player } = useXR();
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Create a raycast target for the menu button
  const handleToggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  
  const handleTeleport = (position) => {
    if (onTeleport) {
      onTeleport(position);
    }
    setMenuVisible(false);
  };
  
  return (
    <group>
      {/* Menu toggle button - follows player left wrist position */}
      <group position={[-0.2, 1, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <Interactive onSelect={handleToggleMenu}>
          <mesh>
            <boxGeometry args={[0.1, 0.1, 0.05]} />
            <meshStandardMaterial color={menuVisible ? "#ff5555" : "#55ff55"} />
          </mesh>
        </Interactive>
        <Text position={[0, 0.15, 0]} fontSize={0.05} anchorX="center">
          {menuVisible ? "Close Menu" : "Menu"}
        </Text>
      </group>
      
      {/* Menu panel */}
      {menuVisible && (
        <group position={[0, 1.5, -1]} rotation={[0, 0, 0]}>
          <mesh>
            <boxGeometry args={[1, 0.8, 0.05]} />
            <meshStandardMaterial color="#222266" opacity={0.8} transparent />
          </mesh>
          
          <Text position={[0, 0.3, 0.03]} fontSize={0.07} color="#ffffff" anchorX="center">
            Navigate To:
          </Text>
          
          {/* Location buttons */}
          <group position={[0, 0.1, 0.03]}>
            {LOCATIONS.map((location, index) => {
              const row = Math.floor(index / 2);
              const col = index % 2;
              const x = col * 0.45 - 0.22;
              const y = -row * 0.15;
              
              return (
                <group key={location.name} position={[x, y, 0]}>
                  <Interactive onSelect={() => handleTeleport(location.position)}>
                    <mesh position={[0, 0, 0]}>
                      <boxGeometry args={[0.4, 0.12, 0.03]} />
                      <meshStandardMaterial color="#4444aa" />
                    </mesh>
                  </Interactive>
                  <Text position={[0, 0, 0.02]} fontSize={0.04} color="#ffffff" anchorX="center">
                    {location.name}
                  </Text>
                </group>
              );
            })}
          </group>
        </group>
      )}
      
      {/* Floor indicators for teleport locations when menu is open */}
      {menuVisible && LOCATIONS.map((location) => (
        <group key={`indicator-${location.name}`} position={[...location.position]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <ringGeometry args={[0.3, 0.4, 32]} />
            <meshBasicMaterial color="#5555ff" transparent opacity={0.6} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.1, 0.2, 32]} />
            <meshBasicMaterial color="#5555ff" transparent opacity={0.8} />
          </mesh>
          <Text 
            position={[0, 0.5, 0.1]} 
            rotation={[Math.PI / 2, 0, 0]} 
            fontSize={0.2} 
            color="#ffffff"
            anchorX="center"
          >
            {location.name}
          </Text>
        </group>
      ))}
      
      {/* Teleport beam - visual indicator from controller to target */}
      {menuVisible && player && (
        <mesh>
          <boxGeometry args={[0.01, 0.01, 10]} />
          <meshBasicMaterial color="#55ffff" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

export default XRMenu;
