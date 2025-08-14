import Papa from "papaparse";
import { ref, getBlob, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

// Function to randomly sample data points
export const sampleData = (data, sampleSize) => {
  if (data.length <= sampleSize) return data;

  const shuffled = [...data].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, sampleSize);
};

// Load and parse CSV data from Firebase Storage
export const loadCSVDataFromFirebase = async (fileName) => {
  try {
    console.log(
      `Loading CSV file from Firebase Storage: csv-files/${fileName}`
    );
    console.log("Firebase storage instance:", storage);
    console.log("Storage bucket:", storage.app.options.storageBucket);

    // Create a reference to the file in the csv-files folder
    const fileRef = ref(storage, `csv-files/${fileName}`);
    console.log("File reference created:", fileRef.fullPath);

    // Get the file as a Blob to avoid CORS issues
    console.log("Attempting to get blob...");
    const blob = await getBlob(fileRef);
    console.log("Blob retrieved successfully:", blob.type, blob.size, "bytes");

    // Convert blob to text
    const csvText = await blob.text();
    console.log(`CSV text length: ${csvText.length} characters`);

    console.log(`Successfully loaded ${fileName}, size: ${blob.size} bytes`);

    // Parse CSV using PapaParse
    const result = Papa.parse(csvText, { header: true });
    console.log("CSV parsing result:", result.data.length, "rows");

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

    console.log(`Parsed ${parsedData.length} data points from ${fileName}`);
    return parsedData;
  } catch (error) {
    console.error("Error loading CSV data from Firebase Storage:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });

    // If Firebase Storage fails, try to fall back to the public folder
    console.log("Attempting fallback to public folder...");
    try {
      return await loadCSVData(fileName);
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      throw new Error(
        `Failed to load CSV file ${fileName} from both Firebase Storage and public folder`
      );
    }
  }
};

// Load and parse CSV data (legacy function for backward compatibility)
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

// Test function to verify Firebase Storage connectivity
export const testFirebaseStorage = async () => {
  try {
    console.log("Testing Firebase Storage connectivity...");

    // List files in the csv-files folder
    const csvFilesRef = ref(storage, "csv-files");
    const result = await listAll(csvFilesRef);

    console.log(
      "Files found in csv-files folder:",
      result.items.map((item) => item.name)
    );

    // Test getting download URL for first file
    if (result.items.length > 0) {
      const firstFile = result.items[0];
      const downloadURL = await getDownloadURL(firstFile);
      console.log("Download URL test successful:", downloadURL);
    }

    return result.items.map((item) => item.name);
  } catch (error) {
    console.error("Firebase Storage test failed:", error);
    throw error;
  }
};
