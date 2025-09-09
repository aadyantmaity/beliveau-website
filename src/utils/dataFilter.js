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

// Filter data by somite ID
export const filterDataBySomiteId = (data, selectedSomiteIds) => {
  if (selectedSomiteIds.length === 0) return data;

  return data.filter((point) => {
    return selectedSomiteIds.includes(point.Somite_ID);
  });
};

// Filter data by somite stage
export const filterDataBySomiteStage = (data, selectedSomiteStages) => {
  if (selectedSomiteStages.length === 0) return data;

  return data.filter((point) => {
    return selectedSomiteStages.includes(point.somite_stage);
  });
};

// Filter data by PC values with range filters
export const filterDataByPC = (data, pcFilters) => {
  if (!pcFilters || Object.keys(pcFilters).length === 0) {
    return data;
  }

  const filterKeys = Object.keys(pcFilters);

  return data.filter((point) => {
    for (let i = 0; i < filterKeys.length; i++) {
      const pc = filterKeys[i];
      const { min, max } = pcFilters[pc];
      const pcValue = point[pc];

      if (pcValue == null || pcValue < min || pcValue > max) {
        return false;
      }
    }
    return true;
  });
};

// Mark points as PC-filtered instead of removing them
export const markPCFilteredPoints = (data, pcFilters) => {
  if (!pcFilters || Object.keys(pcFilters).length === 0) {
    return data.map((point) => ({ ...point, pcFiltered: false }));
  }

  const filterKeys = Object.keys(pcFilters);

  return data.map((point) => {
    let isPCFiltered = false;

    for (let i = 0; i < filterKeys.length; i++) {
      const pc = filterKeys[i];
      const { min, max } = pcFilters[pc];
      const pcValue = point[pc];

      if (pcValue == null || pcValue < min || pcValue > max) {
        isPCFiltered = true;
        break;
      }
    }

    return { ...point, pcFiltered: isPCFiltered };
  });
};

// Clear cache when data changes significantly
export const clearPercentileCache = () => {
  percentileCache.clear();
};
