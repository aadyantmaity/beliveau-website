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
