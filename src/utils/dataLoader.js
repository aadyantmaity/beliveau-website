import Papa from "papaparse";

// Function to randomly sample data points
export const sampleData = (data, sampleSize) => {
  if (data.length <= sampleSize) return data;

  const shuffled = [...data].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, sampleSize);
};

// Load and parse CSV data
export const loadCSVData = async (filePath) => {
  try {
    const response = await fetch(`/${filePath}`);
    const csvText = await response.text();
    const result = Papa.parse(csvText, { header: true });

    let parsedData = result.data
      .map((row) => ({
        centroid_x: parseFloat(row.centroid_x),
        centroid_y: parseFloat(row.centroid_y),
        centroid_z: parseFloat(row.centroid_z),
        mean_intensity_0: parseFloat(row["mean_intensity-0"]),
        mean_intensity_1: parseFloat(row["mean_intensity-1"]),
        mean_intensity_2: parseFloat(row["mean_intensity-2"]),
      }))
      .filter((row) => !isNaN(row.centroid_x));

    return parsedData;
  } catch (error) {
    console.error("Error loading CSV data:", error);
    throw error;
  }
};

// Available CSV files configuration
export const csvFiles = [
  {
    id: "sampled_5000",
    name: "5,000 Observations",
    file: "sampled_5000_observations.csv",
  },
  {
    id: "sampled_50000",
    name: "50,000 Observations",
    file: "sampled_50000_observations.csv",
  },
  {
    id: "sampled_500000",
    name: "500,000 Observations",
    file: "sampled_500000_observations.csv",
  },
];
