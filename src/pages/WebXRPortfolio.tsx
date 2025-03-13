import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  VRButton, 
  ARButton, 
  XR, 
  Hands, 
  Controllers, 
  Interactive, 
  RayGrab,
  useXR 
} from '@react-three/xr';
import { 
  Environment, 
  Text, 
  Sky, 
  Stars,
  Billboard as DreiBoard
} from '@react-three/drei';
import * as THREE from 'three';
import { XRNavigatorProps } from '../types';

// Import visualization components with correct names
import { LlamaCoreXR } from '../components/visualizations/LlamaCoreXR';
import { ParticleSystemXR } from '../components/visualizations/ParticleSystemXR';
import { NetworkVisualizationXR } from '../components/visualizations/NetworkVisualizationXR';
import { TerrainMappingXR } from '../components/visualizations/TerrainMappingXR';
import { NeuralNetworkXR } from '../components/visualizations/NeuralNetworkXR';
import { PortfolioEnvironment } from '../components/environment/PortfolioEnvironment';
import XRMenu from '../components/xr/XRMenu';

type ExperienceType = 'llama' | 'particles' | 'network' | 'terrain' | 'neural' | null;

const XRNavigator: React.FC<XRNavigatorProps> = ({ onTeleport }) => {
  const { player } = useXR();
  
  return (
    <XRMenu onTeleport={(position: THREE.Vector3) => {
      if (player) {
        player.position.copy(position);
        onTeleport(position);
      }
    }} />
  );
};

const WebXRPortfolio: React.FC = () => {
  const [activeExperience, setActiveExperience] = useState<ExperienceType>(null);
  
  return (
    <div className="webxr-container">
      {/* VR/AR entry buttons */}
      <div className="xr-buttons">
        <VRButton className="vr-button" />
        <ARButton className="ar-button" />
      </div>
      
      <Canvas className="webxr-canvas">
        <XR>
          {/* XR interactions */}
          <Hands />
          <Controllers />
          <XRNavigator onTeleport={(position: THREE.Vector3) => {
            // We can log teleport events or implement additional behaviors here
            console.log(`Teleported to ${position.x}, ${position.y}, ${position.z}`);
          }} />
          
          {/* Portfolio environment */}
          <PortfolioEnvironment />
          <Sky sunPosition={[0, 1, 0]} />
          <Stars radius={100} depth={50} count={5000} factor={4} />
          <Environment preset="sunset" />
          
          {/* Welcome Text */}
          <DreiBoard position={[0, 2, -5]}>
            <Text fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle">
              Welcome to my WebXR Tech Portfolio
            </Text>
            <Text position={[0, -0.3, 0]} fontSize={0.1} color="#ccccff" anchorX="center" anchorY="middle">
              Interact with the exhibits using your controllers
            </Text>
          </DreiBoard>
          
          {/* Portfolio visualizations */}
          <group position={[-4, 0, 0]}>
            <RayGrab>
              <Interactive onSelect={() => setActiveExperience('llama')}>
                <LlamaCoreXR scale={0.5} position={[-4, 1.5, -3]} />
                <Text position={[-4, 0.5, -3]} fontSize={0.15} anchorX="center">
                  LlamaCore Visualization
                </Text>
              </Interactive>
            </RayGrab>
          </group>
          
          <group position={[-2, 0, 0]}>
            <RayGrab>
              <Interactive onSelect={() => setActiveExperience('particles')}>
                <ParticleSystemXR scale={0.5} position={[0, 1.5, -3]} />
                <Text position={[0, 0.5, -3]} fontSize={0.15} anchorX="center">
                  Particle System
                </Text>
              </Interactive>
            </RayGrab>
          </group>
          
          <group position={[2, 0, 0]}>
            <RayGrab>
              <Interactive onSelect={() => setActiveExperience('network')}>
                <NetworkVisualizationXR scale={0.5} position={[4, 1.5, -3]} />
                <Text position={[4, 0.5, -3]} fontSize={0.15} anchorX="center">
                  Network Visualization
                </Text>
              </Interactive>
            </RayGrab>
          </group>
          
          <group position={[-4, 0, -6]}>
            <RayGrab>
              <Interactive onSelect={() => setActiveExperience('terrain')}>
                <TerrainMappingXR scale={0.5} position={[-4, 1.5, -6]} />
                <Text position={[-4, 0.5, -6]} fontSize={0.15} anchorX="center">
                  Terrain Mapping
                </Text>
              </Interactive>
            </RayGrab>
          </group>
          
          <group position={[4, 0, -6]}>
            <RayGrab>
              <Interactive onSelect={() => setActiveExperience('neural')}>
                <NeuralNetworkXR scale={0.5} position={[4, 1.5, -6]} />
                <Text position={[4, 0.5, -6]} fontSize={0.15} anchorX="center">
                  Neural Network
                </Text>
              </Interactive>
            </RayGrab>
          </group>
          
          {/* Detail view for active experience */}
          {activeExperience && (
            <group position={[0, 1.5, -3]}>
              <Interactive onSelect={() => setActiveExperience(null)}>
                <mesh position={[0, 2, 0]}>
                  <boxGeometry args={[0.3, 0.3, 0.1]} />
                  <meshStandardMaterial color="red" />
                </mesh>
                <Text position={[0, 2, 0.1]} fontSize={0.1} anchorX="center" anchorY="middle">
                  Close
                </Text>
              </Interactive>
              
              {activeExperience === 'llama' && <LlamaCoreXR scale={1} position={[0, 1.5, 0]} />}
              {activeExperience === 'particles' && <ParticleSystemXR scale={1} position={[0, 1.5, 0]} />}
              {activeExperience === 'network' && <NetworkVisualizationXR scale={1} position={[0, 1.5, 0]} />}
              {activeExperience === 'terrain' && <TerrainMappingXR scale={1} position={[0, 1.5, 0]} />}
              {activeExperience === 'neural' && <NeuralNetworkXR scale={1} position={[0, 1.5, 0]} />}
            </group>
          )}
        </XR>
      </Canvas>
    </div>
  );
};

export default WebXRPortfolio;