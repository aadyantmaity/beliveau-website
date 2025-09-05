import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import DataPoint from "./DataPoint";
import InstancedPoints from "./InstancedPoints";

// Main visualization component
function CSVVisualization({
  data,
  colorMode = "intensity", // Default to intensity mode
  performanceMode,
  intensityChannel,
  anatomyHighlightMode = "none",
  selectedSomiteIds = [],
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

  // Calculate median for anatomy highlighting
  const getAnatomyMedian = (data, mode) => {
    if (data.length === 0) return 0;
    
    let values = [];
    switch (mode) {
      case "anterior":
      case "posterior":
        values = data.map(row => row.Anterior_Posterior);
        break;
      case "dorsal":
      case "ventral":
        values = data.map(row => row.Dorsal_Ventral_Score);
        break;
      case "left":
      case "right":
        values = data.map(row => row.Left_Right_Score);
        break;
      default:
        return 0;
    }
    
    const sortedValues = values.sort((a, b) => a - b);
    const mid = Math.floor(sortedValues.length / 2);
    return sortedValues.length % 2 === 0 
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2 
      : sortedValues[mid];
  };

  const anatomyMedian = useMemo(() => {
    if (anatomyHighlightMode === "none") return 0;
    return getAnatomyMedian(data, anatomyHighlightMode);
  }, [data, anatomyHighlightMode]);

  const getColor = (intensity, mode, fucciClass, point) => {
    // Handle anatomy highlighting mode
    if (anatomyHighlightMode !== "none") {
      let anatomicalValue = 0;
      let isAboveMedian = false;
      
      switch (anatomyHighlightMode) {
        case "anterior":
        case "posterior":
          anatomicalValue = point.Anterior_Posterior;
          isAboveMedian = anatomicalValue >= anatomyMedian;
          break;
        case "dorsal":
        case "ventral":
          anatomicalValue = point.Dorsal_Ventral_Score;
          isAboveMedian = anatomicalValue >= anatomyMedian;
          break;
        case "left":
        case "right":
          anatomicalValue = point.Left_Right_Score;
          isAboveMedian = anatomicalValue >= anatomyMedian;
          break;
        default:
          anatomicalValue = point.Anterior_Posterior;
          isAboveMedian = anatomicalValue >= anatomyMedian;
          break;
      }
      
      // Determine if this point should be highlighted
      let shouldHighlight = false;
      switch (anatomyHighlightMode) {
        case "anterior":
        case "dorsal":
        case "left":
          shouldHighlight = !isAboveMedian; // Below median
          break;
        case "posterior":
        case "ventral":
        case "right":
          shouldHighlight = isAboveMedian; // Above median
          break;
        default:
          shouldHighlight = !isAboveMedian; // Default to below median
          break;
      }
      
      if (shouldHighlight) {
        // Highlighted points - use bright colors based on cell state
        switch (fucciClass) {
          case "FUCCI-Green+":
            return new THREE.Color().setHSL(0.33, 1.0, 0.7); // Bright Green
          case "FUCCI-Red+":
            return new THREE.Color().setHSL(0.0, 1.0, 0.7); // Bright Red
          case "FUCCI-Double+":
            return new THREE.Color().setHSL(0.5, 1.0, 0.7); // Bright Yellow
          case "FUCCI-Negative":
            return new THREE.Color().setHSL(0.6, 0.8, 0.7); // Bright Blue
          default:
            return new THREE.Color().setHSL(0.6, 0.8, 0.7); // Bright Blue
        }
      } else {
        // Non-highlighted points - gray
        return new THREE.Color().setHSL(0, 0, 0.3);
      }
    }
    
    // Original color logic for non-anatomy highlighting modes
    switch (mode) {
      case "intensity":
        return new THREE.Color().setHSL(intensity, 0.8, 0.5);
      case "uniform":
        return new THREE.Color().setHSL(0.6, 0.8, 0.7); // Blue color for uniform mode
      case "cellState":
        // Color based on FUCCI_Class
        switch (fucciClass) {
          case "FUCCI-Green+":
            return new THREE.Color().setHSL(0.33, 1.0, 0.7); // Brighter Green
          case "FUCCI-Red+":
            return new THREE.Color().setHSL(0.0, 1.0, 0.7); // Brighter Red
          case "FUCCI-Negative":
            return new THREE.Color().setHSL(0, 0, 0.5); // Gray
          default:
            return new THREE.Color().setHSL(0, 0, 0.5); // Default gray
        }
      default:
        return new THREE.Color().setHSL(0.6, 0.8, 0.7); // Default blue color
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
          anatomyHighlightMode={anatomyHighlightMode}
          anatomyMedian={anatomyMedian}
          selectedSomiteIds={selectedSomiteIds}
        />
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
          color={getColor(
            point.normalizedIntensity,
            colorMode,
            point.FUCCI_Class,
            point
          )}
          geometryDetail={performanceSettings.geometryDetail}
        />
      ))}
    </group>
  );
}

export default CSVVisualization;
