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

// Filter data based on intensity values
export const filterDataByIntensity = (
  data,
  intensityFilter,
  intensityChannel
) => {
  if (intensityFilter === "all") return data;

  // Get the appropriate intensity values based on selected channel
  const getIntensityValue = (point) => {
    switch (intensityChannel) {
      case "channel_0":
        return point.mean_intensity_0;
      case "channel_1":
        return point.mean_intensity_1;
      case "channel_2":
      default:
        return point.mean_intensity_2;
    }
  };

  const intensityValues = data.map(getIntensityValue);
  const minIntensity = Math.min(...intensityValues);
  const maxIntensity = Math.max(...intensityValues);
  const range = maxIntensity - minIntensity;

  let filterFunction;
  switch (intensityFilter) {
    case "low":
      filterFunction = (point) =>
        getIntensityValue(point) <= minIntensity + range * 0.33;
      break;
    case "medium":
      filterFunction = (point) =>
        getIntensityValue(point) > minIntensity + range * 0.33 &&
        getIntensityValue(point) <= minIntensity + range * 0.66;
      break;
    case "high":
      filterFunction = (point) =>
        getIntensityValue(point) > minIntensity + range * 0.66;
      break;
    default:
      return data;
  }

  return data.filter(filterFunction);
};

// Filter data by magnitude values with percentile ranges
export const filterDataByMagnitude = (
  data,
  selectedMagnitudes,
  magnitudePercentiles
) => {
  if (selectedMagnitudes.length === 0) return data;

  // Pre-calculate percentiles for all selected magnitude types
  const magnitudePercentileValues = {};
  selectedMagnitudes.forEach((magnitudeType) => {
    const percentile = magnitudePercentiles[magnitudeType];
    if (percentile !== "all") {
      let field;
      switch (magnitudeType) {
        case "major":
          field = "major_magnitude";
          break;
        case "intermediate":
          field = "intermediate_magnitude";
          break;
        case "minor":
          field = "minor_magnitude";
          break;
        default:
          return;
      }
      magnitudePercentileValues[magnitudeType] = getPercentiles(data, field);
    }
  });

  return data.filter((point) => {
    return selectedMagnitudes.every((magnitudeType) => {
      const percentile = magnitudePercentiles[magnitudeType];
      if (percentile === "all") return true;

      // Get the magnitude value for this point
      let magnitudeValue;
      switch (magnitudeType) {
        case "major":
          magnitudeValue = point.major_magnitude;
          break;
        case "intermediate":
          magnitudeValue = point.intermediate_magnitude;
          break;
        case "minor":
          magnitudeValue = point.minor_magnitude;
          break;
        default:
          return true;
      }

      if (magnitudeValue === undefined || magnitudeValue === null) return false;

      // Use pre-calculated percentiles
      const { p33, p66 } = magnitudePercentileValues[magnitudeType];

      // Apply percentile filter
      switch (percentile) {
        case "low":
          return magnitudeValue <= p33;
        case "medium":
          return magnitudeValue > p33 && magnitudeValue <= p66;
        case "high":
          return magnitudeValue > p66;
        default:
          return true;
      }
    });
  });
};

// Filter data by cosine values with percentile ranges
export const filterDataByCosine = (
  data,
  selectedCosines,
  cosinePercentiles
) => {
  if (selectedCosines.length === 0) return data;

  // Pre-calculate percentiles for all selected cosine types (using absolute values)
  const cosinePercentileValues = {};
  selectedCosines.forEach((cosineType) => {
    const percentile = cosinePercentiles[cosineType];
    if (percentile !== "all") {
      let field;
      switch (cosineType) {
        case "major":
          field = "cos_major";
          break;
        case "intermediate":
          field = "cos_intermediate";
          break;
        case "minor":
          field = "cos_minor";
          break;
        default:
          return;
      }
      // Calculate percentiles using absolute values
      const absoluteValues = data
        .map((point) => Math.abs(point[field]))
        .filter((val) => !isNaN(val));
      cosinePercentileValues[cosineType] = {
        p33: absoluteValues.sort((a, b) => a - b)[
          Math.floor(absoluteValues.length * 0.33)
        ],
        p66: absoluteValues.sort((a, b) => a - b)[
          Math.floor(absoluteValues.length * 0.66)
        ],
      };
    }
  });

  return data.filter((point) => {
    return selectedCosines.every((cosineType) => {
      const percentile = cosinePercentiles[cosineType];
      if (percentile === "all") return true;

      // Get the cosine value for this point and take absolute value
      let cosineValue;
      switch (cosineType) {
        case "major":
          cosineValue = Math.abs(point.cos_major);
          break;
        case "intermediate":
          cosineValue = Math.abs(point.cos_intermediate);
          break;
        case "minor":
          cosineValue = Math.abs(point.cos_minor);
          break;
        default:
          return true;
      }

      if (cosineValue === undefined || cosineValue === null) return false;

      // Use pre-calculated percentiles
      const { p33, p66 } = cosinePercentileValues[cosineType];

      // Apply percentile filter
      switch (percentile) {
        case "low":
          return cosineValue <= p33;
        case "medium":
          return cosineValue > p33 && cosineValue <= p66;
        case "high":
          return cosineValue > p66;
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
