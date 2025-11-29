import React, { useMemo } from 'react';
import * as THREE from 'three';

interface VoxelVavatchProps {
  radius: number;
  width: number;
  position: [number, number, number];
}

const VoxelVavatch: React.FC<VoxelVavatchProps> = ({ radius, width, position }) => {
  // We need enough voxels to look like a ring, but spread out over a huge area.
  // We will render a SECTION of the ring in higher detail if radius is huge, 
  // but to visualize the whole ring, we distribute points along the circumference.
  const voxelCount = 4000;

  const { positions, colors, rotations } = useMemo(() => {
    const tempPositions: number[] = [];
    const tempColors: number[] = [];
    const tempRotations: number[] = []; // Store rotation per instance

    const colorSea = new THREE.Color('#0EA5E9');
    const colorLand = new THREE.Color('#22C55E');
    const colorWall = new THREE.Color('#64748B'); // Retaining walls
    const colorCloud = new THREE.Color('#FFFFFF');

    for (let i = 0; i < voxelCount; i++) {
      const theta = (i / voxelCount) * Math.PI * 2;
      
      // Randomize Z slightly for plate width
      const zPercent = Math.random() - 0.5; // -0.5 to 0.5
      const z = zPercent * width; 
      
      // The "floor" of the orbital is at Radius.
      // Voxels for terrain are at Radius - height (since 'down' is out, 'up' is in towards center)
      // Wait, centrifugal force 'down' is away from center. So floor is at R.
      // Mountains/atmosphere are at R - h.
      
      // Let's vary the radius slightly to simulate terrain relief on the INSIDE
      const noise = Math.sin(theta * 50) * Math.cos(z * 0.5) + Math.random() * 0.2;
      const isWall = Math.abs(zPercent) > 0.45; // Rim walls
      
      let rOffset = 0;
      let color = colorSea;

      if (isWall) {
        rOffset = -5; // Walls stick "up" (inwards)
        color = colorWall;
      } else if (noise > 0.5) {
        rOffset = -2; // Land sticks "up"
        color = colorLand;
        // Occasional cloud layer further in
        if (Math.random() > 0.95) {
           rOffset = -15; 
           color = colorCloud;
        }
      } else {
        rOffset = 0; // Sea level
        color = colorSea;
      }
      
      const r = radius + rOffset; // In standard coordinates, lower R is "higher" in the sky for an orbital

      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;

      tempPositions.push(x, y, z);
      tempColors.push(color.r, color.g, color.b);
      tempRotations.push(theta);
    }

    return { 
      positions: new Float32Array(tempPositions), 
      colors: new Float32Array(tempColors),
      rotations: new Float32Array(tempRotations)
    };
  }, [radius, width]);

  const meshRef = React.useRef<THREE.InstancedMesh>(null);

  React.useLayoutEffect(() => {
    if (!meshRef.current) return;
    const tempObject = new THREE.Object3D();
    
    // Voxel size needs to be massive to be visible at this scale?
    // If radius is 300, voxel size 1 is okay.
    // If radius is 3000, voxel size 1 is tiny.
    const voxelSize = Math.max(1, radius / 800); 

    for (let i = 0; i < voxelCount; i++) {
      const theta = rotations[i];
      tempObject.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );
      
      // Rotate cube to align with ring curvature
      tempObject.rotation.z = theta + Math.PI / 2;
      
      tempObject.scale.set(voxelSize, voxelSize, voxelSize);
      tempObject.updateMatrix();
      
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      meshRef.current.setColorAt(i, new THREE.Color(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]));
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [positions, colors, rotations, radius]);

  return (
    <group position={position}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, voxelCount]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.5} metalness={0.2} />
      </instancedMesh>
    </group>
  );
};

export default VoxelVavatch;
