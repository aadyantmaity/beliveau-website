import Papa from "papaparse";
import { ref, getBlob } from "firebase/storage";
import { storage } from "../firebase";

// Function to randomly sample data points
export const sampleData = (data, sampleSize) => {
  const startTime = performance.now();
  const startTimestamp = new Date().toISOString();

  console.log(
    `🎲 [${startTimestamp}] Starting data sampling: ${data.length} → ${sampleSize} points`
  );

  if (data.length <= sampleSize) {
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    console.log(
      `✅ [${new Date().toISOString()}] Sampling completed in ${totalTime.toFixed(
        2
      )}ms (no sampling needed)`
    );
    return data;
  }

  const shuffleStartTime = performance.now();
  const shuffled = [...data].sort(() => 0.5 - Math.random());
  const shuffleEndTime = performance.now();

  const sliceStartTime = performance.now();
  const result = shuffled.slice(0, sampleSize);
  const sliceEndTime = performance.now();

  const endTime = performance.now();
  const endTimestamp = new Date().toISOString();
  const totalTime = endTime - startTime;

  console.log(
    `✅ [${endTimestamp}] Sampling completed in ${totalTime.toFixed(2)}ms`
  );
  console.log(`📊 Sampling breakdown:`);
  console.log(
    `   - Shuffling: ${(shuffleEndTime - shuffleStartTime).toFixed(2)}ms`
  );
  console.log(`   - Slicing: ${(sliceEndTime - sliceStartTime).toFixed(2)}ms`);
  console.log(
    `   - Total overhead: ${(
      totalTime -
      (shuffleEndTime - shuffleStartTime) -
      (sliceEndTime - sliceStartTime)
    ).toFixed(2)}ms`
  );

  return result;
};

// Load and parse CSV data from Firebase Storage
export const loadCSVDataFromFirebase = async (fileName) => {
  const startTime = performance.now();
  const startTimestamp = new Date().toISOString();

  console.log(`🚀 [${startTimestamp}] Starting data parsing for: ${fileName}`);
  console.log(`⏱️  [${startTimestamp}] Performance timer started`);

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
    const blobStartTime = performance.now();
    const blob = await getBlob(fileRef);
    const blobEndTime = performance.now();
    console.log(
      `📥 Blob retrieval completed in ${(blobEndTime - blobStartTime).toFixed(
        2
      )}ms`
    );
    console.log("Blob retrieved successfully:", blob.type, blob.size, "bytes");

    // Convert blob to text
    const textStartTime = performance.now();
    const csvText = await blob.text();
    const textEndTime = performance.now();
    console.log(
      `📝 Blob to text conversion completed in ${(
        textEndTime - textStartTime
      ).toFixed(2)}ms`
    );
    console.log(`CSV text length: ${csvText.length} characters`);

    console.log(`Successfully loaded ${fileName}, size: ${blob.size} bytes`);

    // Parse CSV using PapaParse
    const parseStartTime = performance.now();
    const result = Papa.parse(csvText, { header: true });
    const parseEndTime = performance.now();
    console.log(
      `🔍 CSV parsing completed in ${(parseEndTime - parseStartTime).toFixed(
        2
      )}ms`
    );
    console.log("CSV parsing result:", result.data.length, "rows");

    // Data transformation and filtering
    const transformStartTime = performance.now();
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
    const transformEndTime = performance.now();
    console.log(
      `⚙️  Data transformation completed in ${(
        transformEndTime - transformStartTime
      ).toFixed(2)}ms`
    );

    const endTime = performance.now();
    const endTimestamp = new Date().toISOString();
    const totalTime = endTime - startTime;

    console.log(`✅ [${endTimestamp}] Data parsing completed for: ${fileName}`);
    console.log(
      `⏱️  [${endTimestamp}] Total parsing time: ${totalTime.toFixed(2)}ms`
    );
    console.log(`📊 Performance breakdown:`);
    console.log(
      `   - Blob retrieval: ${(blobEndTime - blobStartTime).toFixed(2)}ms`
    );
    console.log(
      `   - Text conversion: ${(textEndTime - textStartTime).toFixed(2)}ms`
    );
    console.log(
      `   - CSV parsing: ${(parseEndTime - parseStartTime).toFixed(2)}ms`
    );
    console.log(
      `   - Data transformation: ${(
        transformEndTime - transformStartTime
      ).toFixed(2)}ms`
    );
    console.log(
      `   - Total overhead: ${(
        totalTime -
        (blobEndTime - blobStartTime) -
        (textEndTime - textStartTime) -
        (parseEndTime - parseStartTime) -
        (transformEndTime - transformStartTime)
      ).toFixed(2)}ms`
    );
    console.log(`📈 Parsed ${parsedData.length} data points from ${fileName}`);

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

// Load and parse all-features CSV data from Firebase Storage
export const loadAllFeaturesDataFromFirebase = async (fileName) => {
  const startTime = performance.now();
  const startTimestamp = new Date().toISOString();

  console.log(
    `🚀 [${startTimestamp}] Starting all-features data parsing for: ${fileName}`
  );
  console.log(`⏱️  [${startTimestamp}] Performance timer started`);

  try {
    console.log(
      `Loading all-features CSV file from Firebase Storage: csv-files/${fileName}`
    );

    // Create a reference to the file in the csv-files folder
    const fileRef = ref(storage, `csv-files/${fileName}`);
    console.log("File reference created:", fileRef.fullPath);

    // Get the file as a Blob to avoid CORS issues
    console.log("Attempting to get blob...");
    const blobStartTime = performance.now();
    const blob = await getBlob(fileRef);
    const blobEndTime = performance.now();
    console.log(
      `📥 Blob retrieval completed in ${(blobEndTime - blobStartTime).toFixed(
        2
      )}ms`
    );
    console.log("Blob retrieved successfully:", blob.type, blob.size, "bytes");

    // Convert blob to text
    const textStartTime = performance.now();
    const csvText = await blob.text();
    const textEndTime = performance.now();
    console.log(
      `📝 Blob to text conversion completed in ${(
        textEndTime - textStartTime
      ).toFixed(2)}ms`
    );
    console.log(`CSV text length: ${csvText.length} characters`);

    console.log(`Successfully loaded ${fileName}, size: ${blob.size} bytes`);

    // Parse CSV using PapaParse
    const parseStartTime = performance.now();
    const result = Papa.parse(csvText, { header: true });
    const parseEndTime = performance.now();
    console.log(
      `🔍 CSV parsing completed in ${(parseEndTime - parseStartTime).toFixed(
        2
      )}ms`
    );
    console.log("CSV parsing result:", result.data.length, "rows");

    // Data transformation and filtering
    const transformStartTime = performance.now();
    let parsedData = result.data
      .map((row) => ({
        centroid_x: parseFloat(row.centroid_x),
        centroid_y: parseFloat(row.centroid_y),
        centroid_z: parseFloat(row.centroid_z),
        mean_intensity_0: parseFloat(row["mean_intensity-0"]),
        mean_intensity_1: parseFloat(row["mean_intensity-1"]),
        mean_intensity_2: parseFloat(row["mean_intensity-2"]),
        major_magnitude: parseFloat(row.major_magnitude),
        intermediate_magnitude: parseFloat(row.intermediate_magnitude),
        minor_magnitude: parseFloat(row.minor_magnitude),
        cos_major: parseFloat(row.cos_major),
        cos_intermediate: parseFloat(row.cos_intermediate),
        cos_minor: parseFloat(row.cos_minor),
      }))
      .filter((row) => !isNaN(row.centroid_x));
    const transformEndTime = performance.now();
    console.log(
      `⚙️  Data transformation completed in ${(
        transformEndTime - transformStartTime
      ).toFixed(2)}ms`
    );

    const endTime = performance.now();
    const endTimestamp = new Date().toISOString();
    const totalTime = endTime - startTime;

    console.log(
      `✅ [${endTimestamp}] All-features data parsing completed for: ${fileName}`
    );
    console.log(
      `⏱️  [${endTimestamp}] Total parsing time: ${totalTime.toFixed(2)}ms`
    );
    console.log(`📊 Performance breakdown:`);
    console.log(
      `   - Blob retrieval: ${(blobEndTime - blobStartTime).toFixed(2)}ms`
    );
    console.log(
      `   - Text conversion: ${(textEndTime - textStartTime).toFixed(2)}ms`
    );
    console.log(
      `   - CSV parsing: ${(parseEndTime - parseStartTime).toFixed(2)}ms`
    );
    console.log(
      `   - Data transformation: ${(
        transformEndTime - transformStartTime
      ).toFixed(2)}ms`
    );
    console.log(
      `   - Total overhead: ${(
        totalTime -
        (blobEndTime - blobStartTime) -
        (textEndTime - textStartTime) -
        (parseEndTime - parseStartTime) -
        (transformEndTime - transformStartTime)
      ).toFixed(2)}ms`
    );
    console.log(`📈 Parsed ${parsedData.length} data points from ${fileName}`);

    return parsedData;
  } catch (error) {
    console.error(
      "Error loading all-features CSV data from Firebase Storage:",
      error
    );
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });

    // If Firebase Storage fails, try to fall back to the public folder
    console.log("Attempting fallback to public folder...");
    try {
      return await loadAllFeaturesData(fileName);
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      throw new Error(
        `Failed to load all-features CSV file ${fileName} from both Firebase Storage and public folder`
      );
    }
  }
};

// Load and parse all-features CSV data (legacy function for backward compatibility)
export const loadAllFeaturesData = async (filePath) => {
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
        major_magnitude: parseFloat(row.major_magnitude),
        intermediate_magnitude: parseFloat(row.intermediate_magnitude),
        minor_magnitude: parseFloat(row.minor_magnitude),
        cos_major: parseFloat(row.cos_major),
        cos_intermediate: parseFloat(row.cos_intermediate),
        cos_minor: parseFloat(row.cos_minor),
      }))
      .filter((row) => !isNaN(row.centroid_x));

    return parsedData;
  } catch (error) {
    console.error("Error loading all-features CSV data:", error);
    throw error;
  }
};

// Available CSV files configuration
export const csvFiles = [
  {
    id: "sampled_5000_observations",
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
