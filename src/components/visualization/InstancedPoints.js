import React, { useRef, useMemo } from "react";
import { Instances, Instance } from "@react-three/drei";
import * as THREE from "three";


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


// High-performance instanced point component for large datasets
function InstancedPoints({
  data,
  colorMode,
  performanceMode,
  intensityChannel,
  anatomicalMode,
  medianValue,
  anatomyHighlightMode,
  anatomyMedian,
  selectedSomiteStages = [],
  selectedCellStates = [],
}) {
  const instancesRef = useRef();

  // Create geometry and material once
  const geometry = useMemo(() => new THREE.SphereGeometry(0.1, 2, 2), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial(), []);

  // Get anatomical value for coloring
  const getAnatomicalValue = (row, mode) => {
    switch (mode) {
      case "anterior_posterior":
        return row.Anterior_Posterior;
      case "dorsal_ventral":
        return row.Dorsal_Ventral_Score;
      case "left_right":
        return row.Left_Right_Score;
      default:
        return row.Anterior_Posterior;
    }
  };

  // Create colors array for all points - optimized
  const colors = useMemo(() => {
    const colorsArray = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const color = new THREE.Color();
      const intensity = data[i].normalizedIntensity;
      const fucciClass = data[i].FUCCI_Class;
      const point = data[i];
      const somiteStage = point.somite_stage;

      // Check if point is PC-filtered - if so, make it black
      if (point.pcFiltered) {
        color.setHSL(0, 0, 0.2); // Dark gray for PC-filtered points
        colorsArray[i] = color;
        continue;
      }


      // Check if this point's somite stage is selected
      const isSomiteStageSelected =
        selectedSomiteStages.length === 0 ||
        selectedSomiteStages.includes(somiteStage);

      // Handle somite stage filtering (takes precedence over anatomy)
      if (selectedSomiteStages.length > 0) {
        // Somite stage highlighting mode - color selected stages, gray out others
        const isCellStateSelected = point.cellStateSelected;
        
        if (isSomiteStageSelected && isCellStateSelected) {
          // Selected somite stage points with selected cell state - use colors based on cell state
          switch (fucciClass) {
            case "FUCCI-Green+":
              color.setHSL(0.33, 1.0, 0.7); // Bright Green
              break;
            case "FUCCI-Red+":
              color.setHSL(0.0, 1.0, 0.7); // Bright Red
              break;
            case "FUCCI-Double+":
              color.setHSL(0.5, 1.0, 0.7); // Bright Yellow
              break;
            case "FUCCI-Negative":
              color.setHSL(0.6, 0.8, 0.7); // Blue
              break;
            default:
              color.setHSL(0.6, 0.8, 0.7); // Blue
          }
        } else {
          // Non-selected somite stage points or non-selected cell states - gray
          color.setHSL(0, 0, 0.2);
        }
      } else if (anatomyHighlightMode && anatomyHighlightMode !== "none") {
        // Handle anatomy highlighting mode (only when no somite stage filter is active)
        const isCellStateSelected = point.cellStateSelected;

        if (isCellStateSelected) {
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
            color.setHSL(h, s, l);
          } else {
            // Fallback to gray if no pre-computed color
            color.setHSL(0, 0, 0.3);
          }
        } else {
          // Non-selected cell states - gray
          color.setHSL(0, 0, 0.3);
        }
      } else if (colorMode === "intensity") {
        color.setHSL(intensity, 0.8, 0.5);
      } else if (colorMode === "cellState") {
        // Handle cell state selection coloring
        const isCellStateSelected = point.cellStateSelected;
        
        if (!isCellStateSelected) {
          // Non-selected cells are gray
          color.setHSL(0, 0, 0.2);
        } else {
          // Selected cells get their respective colors
          switch (fucciClass) {
            case "FUCCI-Green+":
              color.setHSL(0.33, 1.0, 0.7); // Bright Green
              break;
            case "FUCCI-Red+":
              color.setHSL(0.0, 1.0, 0.7); // Bright Red
              break;
            case "FUCCI-Double+":
              color.setHSL(0.5, 1.0, 0.7); // Bright Yellow
              break;
            case "FUCCI-Negative":
              color.setHSL(0.6, 0.8, 0.7); // Bright Blue
              break;
            default:
              color.setHSL(0.6, 0.8, 0.7); // Bright Blue
          }
        }
      } else if (colorMode === "anatomical") {
        // Color based on anatomical value (50% split)
        const anatomicalValue = getAnatomicalValue(data[i], anatomicalMode);
        const isAboveMedian = anatomicalValue >= medianValue;

        if (isAboveMedian) {
          color.setHSL(0.0, 0.8, 0.6); // Red for above median
        } else {
          color.setHSL(0.6, 0.8, 0.6); // Blue for below median
        }
      } else {
        color.setHSL(0.6, 0.8, 0.7); // Blue color for uniform mode
      }
      colorsArray[i] = color;
    }
    return colorsArray;
  }, [
    data,
    colorMode,
    anatomicalMode,
    medianValue,
    anatomyHighlightMode,
    selectedSomiteStages,
  ]);

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
