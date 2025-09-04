// Cache for pre-calculated percentiles
const percentileCache = new Map();

// Helper function to get or calculate percentiles
const getPercentiles = (data, field) => {
  const cacheKey = `${field}_${data.length}`;

  if (percentileCache.has(cacheKey)) {
    return percentileCache.get(cacheKey);
  }

  const values = data
    .map((p) => p[field])
    .filter((v) => v !== undefined && v !== null)
    .sort((a, b) => a - b);
  const p33 = values[Math.floor(values.length * 0.33)];
  const p66 = values[Math.floor(values.length * 0.66)];

  const percentiles = { p33, p66 };
  percentileCache.set(cacheKey, percentiles);

  return percentiles;
};

// Filter data by cell state (FUCCI class)
export const filterDataByCellState = (data, selectedCellStates) => {
  if (selectedCellStates.length === 0) return data;

  return data.filter((point) => {
    return selectedCellStates.includes(point.FUCCI_Class);
  });
};

// Filter data by anatomy score values with percentile ranges
export const filterDataByAnatomyScore = (
  data,
  selectedAnatomyScores,
  anatomyScorePercentiles
) => {
  if (selectedAnatomyScores.length === 0) return data;

  // Pre-calculate percentiles for all selected anatomy score types
  const anatomyScorePercentileValues = {};
  selectedAnatomyScores.forEach((scoreType) => {
    const percentile = anatomyScorePercentiles[scoreType];
    if (percentile !== "all") {
      anatomyScorePercentileValues[scoreType] = getPercentiles(data, scoreType);
    }
  });

  return data.filter((point) => {
    return selectedAnatomyScores.every((scoreType) => {
      const percentile = anatomyScorePercentiles[scoreType];
      if (percentile === "all") return true;

      const scoreValue = point[scoreType];
      if (scoreValue === undefined || scoreValue === null) return false;

      // Use pre-calculated percentiles
      const { p33, p66 } = anatomyScorePercentileValues[scoreType];

      // Apply percentile filter
      switch (percentile) {
        case "low":
          return scoreValue <= p33;
        case "medium":
          return scoreValue > p33 && scoreValue <= p66;
        case "high":
          return scoreValue > p66;
        default:
          return true;
      }
    });
  });
};

// Filter data by PC values with percentile ranges
export const filterDataByPC = (data, selectedPCs, pcPercentiles) => {
  if (selectedPCs.length === 0) return data;

  // Pre-calculate percentiles for all selected PC types
  const pcPercentileValues = {};
  selectedPCs.forEach((pcType) => {
    const percentile = pcPercentiles[pcType];
    if (percentile !== "all") {
      pcPercentileValues[pcType] = getPercentiles(data, pcType);
    }
  });

  return data.filter((point) => {
    return selectedPCs.every((pcType) => {
      const percentile = pcPercentiles[pcType];
      if (percentile === "all") return true;

      const pcValue = point[pcType];
      if (pcValue === undefined || pcValue === null) return false;

      // Use pre-calculated percentiles
      const { p33, p66 } = pcPercentileValues[pcType];

      // Apply percentile filter
      switch (percentile) {
        case "low":
          return pcValue <= p33;
        case "medium":
          return pcValue > p33 && pcValue <= p66;
        case "high":
          return pcValue > p66;
        default:
          return true;
      }
    });
  });
};

// Filter data by PC mpId values with percentile ranges
export const filterDataByPCmpId = (
  data,
  selectedPCmpIds,
  pcmpIdPercentiles
) => {
  if (selectedPCmpIds.length === 0) return data;

  // Pre-calculate percentiles for all selected PC mpId types
  const pcmpIdPercentileValues = {};
  selectedPCmpIds.forEach((pcmpIdType) => {
    const percentile = pcmpIdPercentiles[pcmpIdType];
    if (percentile !== "all") {
      pcmpIdPercentileValues[pcmpIdType] = getPercentiles(data, pcmpIdType);
    }
  });

  return data.filter((point) => {
    return selectedPCmpIds.every((pcmpIdType) => {
      const percentile = pcmpIdPercentiles[pcmpIdType];
      if (percentile === "all") return true;

      const pcmpIdValue = point[pcmpIdType];
      if (pcmpIdValue === undefined || pcmpIdValue === null) return false;

      // Use pre-calculated percentiles
      const { p33, p66 } = pcmpIdPercentileValues[pcmpIdType];

      // Apply percentile filter
      switch (percentile) {
        case "low":
          return pcmpIdValue <= p33;
        case "medium":
          return pcmpIdValue > p33 && pcmpIdValue <= p66;
        case "high":
          return pcmpIdValue > p66;
        default:
          return true;
      }
    });
  });
};

// Filter data by somite stage values with percentile ranges
export const filterDataBySomiteStage = (
  data,
  selectedSomiteStages,
  somiteStagePercentiles
) => {
  if (selectedSomiteStages.length === 0) return data;

  // Pre-calculate percentiles for all selected somite stage types
  const somiteStagePercentileValues = {};
  selectedSomiteStages.forEach((stageType) => {
    const percentile = somiteStagePercentiles[stageType];
    if (percentile !== "all") {
      somiteStagePercentileValues[stageType] = getPercentiles(data, stageType);
    }
  });

  return data.filter((point) => {
    return selectedSomiteStages.every((stageType) => {
      const percentile = somiteStagePercentiles[stageType];
      if (percentile === "all") return true;

      const stageValue = point[stageType];
      if (stageValue === undefined || stageValue === null) return false;

      // Use pre-calculated percentiles
      const { p33, p66 } = somiteStagePercentileValues[stageType];

      // Apply percentile filter
      switch (percentile) {
        case "low":
          return stageValue <= p33;
        case "medium":
          return stageValue > p33 && stageValue <= p66;
        case "high":
          return stageValue > p66;
        default:
          return true;
      }
    });
  });
};

// Filter data by somite ID values with percentile ranges
export const filterDataBySomiteId = (
  data,
  selectedSomiteIds,
  somiteIdPercentiles
) => {
  if (selectedSomiteIds.length === 0) return data;

  // Pre-calculate percentiles for all selected somite ID types
  const somiteIdPercentileValues = {};
  selectedSomiteIds.forEach((idType) => {
    const percentile = somiteIdPercentiles[idType];
    if (percentile !== "all") {
      somiteIdPercentileValues[idType] = getPercentiles(data, idType);
    }
  });

  return data.filter((point) => {
    return selectedSomiteIds.every((idType) => {
      const percentile = somiteIdPercentiles[idType];
      if (percentile === "all") return true;

      const idValue = point[idType];
      if (idValue === undefined || idValue === null) return false;

      // Use pre-calculated percentiles
      const { p33, p66 } = somiteIdPercentileValues[idType];

      // Apply percentile filter
      switch (percentile) {
        case "low":
          return idValue <= p33;
        case "medium":
          return idValue > p33 && idValue <= p66;
        case "high":
          return idValue > p66;
        default:
          return true;
      }
    });
  });
};

// Clear cache when data changes significantly
export const clearPercentileCache = () => {
  percentileCache.clear();
};
