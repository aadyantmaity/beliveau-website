import React, { useRef } from "react";

// Optimized Point component for individual data points (for small datasets)
function DataPoint({ position, intensity, color, geometryDetail = 8 }) {
  const meshRef = useRef();

  // Only animate to reduce CPU usage
  // useFrame(() => {
  //   if (meshRef.current) {
  //     meshRef.current.rotation.x += 0.01;
  //     meshRef.current.rotation.y += 0.01;
  //   }
  // });

  return (
    <group position={position}>
      <mesh ref={meshRef} scale={1}>
        <sphereGeometry args={[0.025, geometryDetail, geometryDetail]} />
        <meshStandardMaterial
          color={color}
          emissive="#000000"
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  );
}

export default DataPoint;
