import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import DataPoint from "./DataPoint";
import InstancedPoints from "./InstancedPoints";

// Anatomical labels component for 3D space orientation
function AnatomicalLabels() {
  return (
    <group>
      {/* Anterior label - positioned in front of the data */}
      <Text
        position={[15, 0, 0]}
        fontSize={1.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#000000"
      >
        ANTERIOR
      </Text>

      {/* Posterior label - positioned behind the data */}
      <Text
        position={[-15, 0, 0]}
        fontSize={1.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#000000"
      >
        POSTERIOR
      </Text>
    </group>
  );
}

// Main visualization component
function CSVVisualization({
  data,
  colorMode,
  performanceMode,
  intensityChannel,
}) {
  const groupRef = useRef();

  // Performance optimization based on dataset size
  const performanceSettings = useMemo(() => {
    if (performanceMode === "auto") {
      // Auto mode - optimized for large datasets
      if (data.length > 10000) {
        return {
          useInstancing: true,
          geometryDetail: 2,
        };
      } else if (data.length > 1000) {
        return {
          useInstancing: true,
          geometryDetail: 4,
        };
      } else {
        return {
          useInstancing: false,
          geometryDetail: 8,
        };
      }
    }
    return {
      useInstancing: performanceMode === "instanced",
      geometryDetail: 8,
    };
  }, [data.length, performanceMode]);

  // Normalize data for visualization
  const normalizeData = (data, intensityChannel) => {
    if (data.length === 0) return [];

    // Get the appropriate intensity values based on selected channel
    const getIntensityValue = (row) => {
      switch (intensityChannel) {
        case "channel_0":
          return row.mean_intensity_0;
        case "channel_1":
          return row.mean_intensity_1;
        case "channel_2":
        default:
          return row.mean_intensity_2;
      }
    };

    // Calculate ranges for normalization
    const xValues = data.map((row) => row.centroid_x);
    const yValues = data.map((row) => row.centroid_y);
    const zValues = data.map((row) => row.centroid_z);
    const intensityValues = data.map(getIntensityValue);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const minZ = Math.min(...zValues);
    const maxZ = Math.max(...zValues);
    const minIntensity = Math.min(...intensityValues);
    const maxIntensity = Math.max(...intensityValues);

    // Calculate normalization factors
    const xFactor = 20 / (maxX - minX);
    const yFactor = 20 / (maxY - minY);
    const zFactor = 20 / (maxZ - minZ);
    const intensityFactor = 1 / (maxIntensity - minIntensity);

    return data.map((row) => ({
      ...row,
      normalizedX: (row.centroid_x - minX) * xFactor - 10,
      normalizedY: (row.centroid_y - minY) * yFactor - 10,
      normalizedZ: (row.centroid_z - minZ) * zFactor - 10,
      normalizedIntensity:
        (getIntensityValue(row) - minIntensity) * intensityFactor,
    }));
  };

  const normalizedData = useMemo(
    () => normalizeData(data, intensityChannel),
    [data, intensityChannel]
  );

  const getColor = (intensity, mode) => {
    switch (mode) {
      case "intensity":
        return new THREE.Color().setHSL(intensity, 0.8, 0.5);
      default:
        return new THREE.Color().setHSL(0, 0, 0.8); // Gray/white color
    }
  };

  // Use instanced rendering for large datasets
  if (performanceSettings.useInstancing) {
    return (
      <group ref={groupRef}>
        <InstancedPoints
          data={normalizedData}
          colorMode={colorMode}
          performanceMode={performanceMode}
          intensityChannel={intensityChannel}
        />
        <AnatomicalLabels />
      </group>
    );
  }

  // Use individual points for smaller datasets
  return (
    <group ref={groupRef}>
      {normalizedData.map((point, index) => (
        <DataPoint
          key={index}
          position={[point.normalizedX, point.normalizedY, point.normalizedZ]}
          intensity={point.mean_intensity_2}
          color={getColor(point.normalizedIntensity, colorMode)}
          geometryDetail={performanceSettings.geometryDetail}
        />
      ))}
      <AnatomicalLabels />
    </group>
  );
}

export default CSVVisualization;
