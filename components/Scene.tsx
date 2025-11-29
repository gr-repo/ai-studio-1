import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import VoxelEarth from './VoxelEarth';
import VoxelVavatch from './VoxelVavatch';

interface SceneProps {
  scaleModeRatio: number; // 0 to 1, where 0 is comparison (visible) and 1 is true scale
}

// Vavatch Dimensions (Approximate based on book)
// Circumference = 14 million km.
// Radius = 14M / 2PI ~= 2.23 million km.
// Earth Radius = 6371 km.
// Ratio R_V / R_E ~= 350.
const TRUE_SCALE_RATIO = 350;
const VISIBLE_SCALE_RATIO = 15; // A cheat ratio so we can see both easily

const CameraController: React.FC<{ targetRadius: number }> = ({ targetRadius }) => {
  const { camera, controls } = useThree();
  const vec = new THREE.Vector3();
  
  useEffect(() => {
    // Smoothly back camera out when scale increases
    const dist = targetRadius * 1.5 + 50;
    camera.position.lerp(vec.set(0, 0, dist), 0.1);
    camera.far = 100000;
    camera.updateProjectionMatrix();
  }, [targetRadius, camera, vec]);

  return null;
}

const Scene: React.FC<SceneProps> = ({ scaleModeRatio }) => {
  // Interpolate radius based on slider
  // If ratio is 0 (Comparison), radius is VISIBLE_SCALE_RATIO
  // If ratio is 1 (True), radius is TRUE_SCALE_RATIO
  // We use a logarithmic feel or linear interpolation? Linear is simpler for "Scale"
  const vavatchRadius = VISIBLE_SCALE_RATIO + (TRUE_SCALE_RATIO - VISIBLE_SCALE_RATIO) * scaleModeRatio;
  
  // Earth is fixed at Radius 1 unit (representing ~6000km)
  const earthRadius = 1;
  
  // Vavatch plate width ~ 4000km? (Continent sized). Let's say Width = Earth Diameter * 0.8
  const vavatchWidth = 1.5;

  return (
    <Canvas camera={{ position: [0, 0, 50], fov: 45, far: 20000 }}>
      <color attach="background" args={['#000000']} />
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <ambientLight intensity={0.2} />
      <pointLight position={[500, 500, 500]} intensity={1.5} />
      <pointLight position={[-500, -500, -200]} intensity={0.5} color="blue" />

      {/* Earth placed at the center for reference, or offset?
          Let's place Vavatch centered, and Earth hovering near the rim to show scale.
          If Vavatch R = 100, Earth is at x = 100 + 5.
      */}
      <group>
        <VoxelVavatch radius={vavatchRadius} width={vavatchWidth} position={[0,0,0]} />
        
        {/* Place Earth near the bottom inner rim to simulate "looking up at the arch" or just outside */}
        <VoxelEarth radius={earthRadius} position={[vavatchRadius + 5, 0, 0]} />
      </group>

      <OrbitControls minDistance={5} maxDistance={5000} />
      <CameraController targetRadius={vavatchRadius} />
    </Canvas>
  );
};

export default Scene;
