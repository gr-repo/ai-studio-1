import React, { useMemo } from 'react';
import * as THREE from 'three';

interface VoxelEarthProps {
  radius: number;
  position: [number, number, number];
}

const VoxelEarth: React.FC<VoxelEarthProps> = ({ radius, position }) => {
  const voxelCount = 800;
  
  const { positions, colors } = useMemo(() => {
    const tempPositions: number[] = [];
    const tempColors: number[] = [];
    const colorBlue = new THREE.Color('#1E3A8A'); // Ocean
    const colorGreen = new THREE.Color('#10B981'); // Land
    const colorWhite = new THREE.Color('#F3F4F6'); // Clouds/Ice

    // Fibonacci sphere algorithm for even distribution
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < voxelCount; i++) {
      const y = 1 - (i / (voxelCount - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Scale by radius
      tempPositions.push(x * radius, y * radius, z * radius);

      // Simple noise-like coloring
      const noise = Math.sin(x * 5) * Math.cos(y * 5) * Math.sin(z * 5);
      if (y > 0.8 || y < -0.8) {
        tempColors.push(colorWhite.r, colorWhite.g, colorWhite.b);
      } else if (noise > 0.2) {
        tempColors.push(colorGreen.r, colorGreen.g, colorGreen.b);
      } else {
        tempColors.push(colorBlue.r, colorBlue.g, colorBlue.b);
      }
    }

    return { positions: new Float32Array(tempPositions), colors: new Float32Array(tempColors) };
  }, [radius]);

  const meshRef = React.useRef<THREE.InstancedMesh>(null);

  React.useLayoutEffect(() => {
    if (!meshRef.current) return;
    const tempObject = new THREE.Object3D();
    
    for (let i = 0; i < voxelCount; i++) {
      tempObject.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );
      // Make voxels slightly smaller than grid to look "voxelly"
      const scale = radius * 0.15; 
      tempObject.scale.set(scale, scale, scale);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      meshRef.current.setColorAt(i, new THREE.Color(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]));
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [positions, colors, radius]);

  return (
    <group position={position}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, voxelCount]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.8} metalness={0.1} />
      </instancedMesh>
    </group>
  );
};

export default VoxelEarth;
