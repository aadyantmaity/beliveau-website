import React, { useRef, useMemo } from "react";
import { Instances, Instance } from "@react-three/drei";
import * as THREE from "three";

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
  selectedSomiteIds = [],
  selectedSomiteStages = [],
  selectedCellStates = [],
}) {
  const instancesRef = useRef();

  // Create geometry and material once
  const geometry = useMemo(() => new THREE.SphereGeometry(0.025, 2, 2), []);
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
      const somiteId = point.Somite_ID;
      const somiteStage = point.somite_stage;

      // Check if point is PC-filtered - if so, make it black
      if (point.pcFiltered) {
        color.setHSL(0, 0, 0.5); // Black for PC-filtered points
        colorsArray[i] = color;
        continue;
      }

      // Check if this point's somite is selected
      const isSomiteSelected =
        selectedSomiteIds.length === 0 || selectedSomiteIds.includes(somiteId);

      // Check if this point's somite stage is selected
      const isSomiteStageSelected =
        selectedSomiteStages.length === 0 ||
        selectedSomiteStages.includes(somiteStage);

      // Handle anatomy highlighting mode
      if (anatomyHighlightMode && anatomyHighlightMode !== "none") {
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

        // Check if this point's cell state is selected (if cell state filtering is active)
        const isCellStateSelected = point.cellStateSelected;

        if (shouldHighlight && isCellStateSelected) {
          // Highlighted points with selected cell state - use bright colors based on cell state
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
          // Non-highlighted points or non-selected cell states - gray
          color.setHSL(0, 0, 0.5);
        }
      } else if (selectedSomiteIds.length > 0) {
        // Somite highlighting mode - color selected somites, gray out others
        const isCellStateSelected = point.cellStateSelected;
        
        if (isSomiteSelected && isCellStateSelected) {
          // Selected somite points with selected cell state - use colors based on cell state
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
          // Non-selected somite points or non-selected cell states - gray
          color.setHSL(0, 0, 0.5);
        }
      } else if (selectedSomiteStages.length > 0) {
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
          color.setHSL(0, 0, 0.5);
        }
      } else if (colorMode === "intensity") {
        color.setHSL(intensity, 0.8, 0.5);
      } else if (colorMode === "cellState") {
        // Handle cell state selection coloring
        const isCellStateSelected = point.cellStateSelected;
        
        if (!isCellStateSelected) {
          // Non-selected cells are gray
          color.setHSL(0, 0, 0.5);
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
    anatomyMedian,
    selectedSomiteIds,
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
