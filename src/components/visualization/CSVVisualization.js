import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import DataPoint from "./DataPoint";
import InstancedPoints from "./InstancedPoints";


// Convert hex color to HSL
const hexToHsl = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0; break;
    }
    h /= 6;
  }
  
  return [h, s, l];
};


// Main visualization component
function CSVVisualization({
  data,
  colorMode = "intensity", // Default to intensity mode
  performanceMode,
  intensityChannel,
  anatomyHighlightMode = "none",
  selectedSomiteStages = [],
  selectedCellStates = [],
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
        values = data.map((row) => row.Anterior_Posterior);
        break;
      case "dorsal":
      case "ventral":
        values = data.map((row) => row.Dorsal_Ventral_Score);
        break;
      case "left":
      case "right":
        values = data.map((row) => row.Left_Right_Score);
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
    // Check if point is PC-filtered - if so, make it black
    if (point.pcFiltered) {
      return new THREE.Color().setHSL(0, 0, 0.2); // Dark gray for PC-filtered points
    }

    // Handle cell state selection coloring
    if (mode === "cellState") {
      // Check if this cell state is selected
      const isCellStateSelected = point.cellStateSelected;
      
      if (!isCellStateSelected) {
        // Non-selected cells are gray
        return new THREE.Color().setHSL(0, 0, 0.3);
      }
      
      // Selected cells get their respective colors
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
    }

    // Handle somite stage filtering (takes precedence over anatomy)
    if (selectedSomiteStages.length > 0) {
      // Check if this point's somite stage is selected
      const isSomiteStageSelected = selectedSomiteStages.includes(point.somite_stage);
      const isCellStateSelected = point.cellStateSelected;
      
      if (isSomiteStageSelected && isCellStateSelected) {
        // Selected somite stage points with selected cell state - use colors based on cell state
        switch (fucciClass) {
          case "FUCCI-Green+":
            return new THREE.Color().setHSL(0.33, 1.0, 0.7); // Bright Green
          case "FUCCI-Red+":
            return new THREE.Color().setHSL(0.0, 1.0, 0.7); // Bright Red
          case "FUCCI-Double+":
            return new THREE.Color().setHSL(0.5, 1.0, 0.7); // Bright Yellow
          case "FUCCI-Negative":
            return new THREE.Color().setHSL(0.6, 0.8, 0.7); // Blue
          default:
            return new THREE.Color().setHSL(0.6, 0.8, 0.7); // Blue
        }
      } else {
        // Non-selected somite stage points or non-selected cell states - gray
        return new THREE.Color().setHSL(0, 0, 0.3);
      }
    }
    // Handle anatomy highlighting mode (only when no somite stage filter is active)
    else if (anatomyHighlightMode !== "none") {
      // Use pre-computed anatomy color from the data
      let anatomyColor = null;
      switch (anatomyHighlightMode) {
        case "anterior_posterior":
          anatomyColor = point.Anterior_Posterior_Color;
          break;
        case "dorsal_ventral":
          anatomyColor = point.Dorsal_Ventral_Color;
          break;
        case "left_right":
          anatomyColor = point.Left_Right_Color;
          break;
        default:
          anatomyColor = point.Anterior_Posterior_Color;
      }
      
      if (anatomyColor) {
        const [h, s, l] = hexToHsl(anatomyColor);
        return new THREE.Color().setHSL(h, s, l);
      } else {
        // Fallback to gray if no pre-computed color
        return new THREE.Color().setHSL(0, 0, 0.3);
      }
    }

    // Original color logic for non-anatomy highlighting modes
    switch (mode) {
      case "intensity":
        return new THREE.Color().setHSL(intensity, 0.8, 0.5);
      case "uniform":
        return new THREE.Color().setHSL(0.6, 0.8, 0.7); // Blue color for uniform mode
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
          selectedSomiteStages={selectedSomiteStages}
          selectedCellStates={selectedCellStates}
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
