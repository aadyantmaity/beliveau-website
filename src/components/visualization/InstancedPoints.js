import React, { useRef, useMemo } from "react";
import { Instances, Instance } from "@react-three/drei";
import * as THREE from "three";

// High-performance instanced point component for large datasets
function InstancedPoints({
  data,
  colorMode,
  performanceMode,
  intensityChannel,
}) {
  const instancesRef = useRef();

  // Create geometry and material once
  const geometry = useMemo(() => new THREE.SphereGeometry(0.025, 2, 2), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial(), []);

  // Create colors array for all points - optimized
  const colors = useMemo(() => {
    const colorsArray = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const color = new THREE.Color();
      const intensity = data[i].normalizedIntensity;
      const fucciClass = data[i].FUCCI_Class;

      if (colorMode === "intensity") {
        color.setHSL(intensity, 0.8, 0.5);
      } else if (colorMode === "cellState") {
        // Color based on FUCCI_Class
        switch (fucciClass) {
          case "FUCCI-Green+":
            color.setHSL(0.33, 1.0, 0.7); // Brighter Green
            break;
          case "FUCCI-Red+":
            color.setHSL(0.0, 1.0, 0.7); // Brighter Red
            break;
          case "FUCCI-Negative":
            color.setHSL(0, 0, 0.5); // Gray
            break;
          default:
            color.setHSL(0, 0, 0.5); // Default gray
        }
      } else {
        color.setHSL(0.6, 0.8, 0.7); // Blue color for uniform mode
      }
      colorsArray[i] = color;
    }
    return colorsArray;
  }, [data, colorMode]);

  return (
    <Instances
      ref={instancesRef}
      limit={data.length}
      range={data.length}
      geometry={geometry}
      material={material}
    >
      {data.map((point, index) => (
        <Instance
          key={index}
          position={[point.normalizedX, point.normalizedY, point.normalizedZ]}
          color={colors[index]}
        />
      ))}
    </Instances>
  );
}

export default InstancedPoints;
