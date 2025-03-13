import React from 'react';
import { Interactive } from '@react-three/xr';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface XRMenuProps {
  onTeleport: (position: THREE.Vector3) => void;
}

interface MenuOption {
  id: string;
  label: string;
  position: [number, number, number];
}

const XRMenu: React.FC<XRMenuProps> = ({ onTeleport }) => {
  const menuOptions: MenuOption[] = [
    { id: 'llama', label: 'LlamaCore', position: [-4, 1.5, -3] },
    { id: 'particles', label: 'Particles', position: [0, 1.5, -3] },
    { id: 'network', label: 'Network', position: [4, 1.5, -3] },
    { id: 'terrain', label: 'Terrain', position: [-4, 1.5, -6] },
    { id: 'neural', label: 'Neural', position: [4, 1.5, -6] },
  ];

  const handleTeleport = (position: [number, number, number]): void => {
    onTeleport(new THREE.Vector3(...position));
  };

  return (
    <group position={[0, 1, 0]}>
      {menuOptions.map((option) => (
        <Interactive
          key={option.id}
          onSelect={() => handleTeleport(option.position)}
        >
          <group position={[0, option.position[1], option.position[2]]}>
            <mesh>
              <boxGeometry args={[0.3, 0.1, 0.05]} />
              <meshStandardMaterial color="#4488ff" />
            </mesh>
            <Text
              position={[0, 0.1, 0]}
              fontSize={0.1}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {option.label}
            </Text>
          </group>
        </Interactive>
      ))}
      
      {/* Help text */}
      <Text
        position={[0, 2, -4]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        Select a destination to teleport
      </Text>
    </group>
  );
};

export default XRMenu;
