import Papa from "papaparse";
import { ref, getBlob } from "firebase/storage";
import { storage } from "../firebase";

// Function to randomly sample data points
export const sampleData = (data, sampleSize) => {
  if (data.length <= sampleSize) {
    return data;
  }

  const shuffled = [...data].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, sampleSize);
};

// Load and parse updated filters CSV data from Firebase Storage
export const loadUpdatedFiltersDataFromFirebase = async (fileName) => {
  const startTime = performance.now();
  const startTimestamp = new Date().toISOString();

  console.log(
    `🚀 [${startTimestamp}] Starting updated filters data parsing for: ${fileName}`
  );
  console.log(`⏱️  [${startTimestamp}] Performance timer started`);

  try {
    console.log(
      `Loading updated filters CSV file from Firebase Storage: csv-files/${fileName}`
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

    // Debug: Log available fields in the first row
    if (result.data.length > 0) {
      console.log("Available CSV fields:", Object.keys(result.data[0]));
    }

    // Data transformation and filtering for updated filters data
    const transformStartTime = performance.now();
    let parsedData = result.data
      .map((row) => ({
        centroid_x: parseFloat(row.centroid_x),
        centroid_y: parseFloat(row.centroid_y),
        centroid_z: parseFloat(row.centroid_z),
        // Add intensity fields for visualization compatibility
        mean_intensity_0: parseFloat(row["mean_intensity-0"]) || 0,
        mean_intensity_1: parseFloat(row["mean_intensity-1"]) || 0,
        mean_intensity_2: parseFloat(row["mean_intensity-2"]) || 0,
        // Updated filters specific fields
        Dorsal_Ventral_Score: parseFloat(row.Dorsal_Ventral_Score),
        Left_Right_Score: parseFloat(row.Left_Right_Score),
        Anterior_Posterior: parseFloat(row.Anterior_Posterior),
        FUCCI_Class: row.FUCCI_Class,
        Somite_ID: parseInt(row.Somite_ID),
        somite_stage: parseInt(row.somite_stage),
        PC1: parseFloat(row.PC1),
        PC2: parseFloat(row.PC2),
        PC3: parseFloat(row.PC3),
        PC4: parseFloat(row.PC4),
        PC5: parseFloat(row.PC5),
        PC6: parseFloat(row.PC6),
        PC7: parseFloat(row.PC7),
        PC8: parseFloat(row.PC8),
        PC1_mpId: parseFloat(row.PC1_mpId),
        PC2_mpId: parseFloat(row.PC2_mpId),
        PC3_mpId: parseFloat(row.PC3_mpId),
        PC4_mpId: parseFloat(row.PC4_mpId),
        PC5_mpId: parseFloat(row.PC5_mpId),
        PC6_mpId: parseFloat(row.PC6_mpId),
        PC7_mpId: parseFloat(row.PC7_mpId),
        PC8_mpId: parseFloat(row.PC8_mpId),
        // Pre-computed anatomy colors
        Dorsal_Ventral_Color: row.Dorsal_Ventral_Color,
        Left_Right_Color: row.Left_Right_Color,
        Anterior_Posterior_Color: row.Anterior_Posterior_Color,
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
      `✅ [${endTimestamp}] Updated filters data parsing completed for: ${fileName}`
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

    // Debug: Log sample of parsed data structure
    if (parsedData.length > 0) {
      console.log("Sample parsed data point:", parsedData[0]);
    }

    return parsedData;
  } catch (error) {
    console.error(
      "Error loading updated filters CSV data from Firebase Storage:",
      error
    );
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });

    throw new Error(
      `Failed to load updated filters CSV file ${fileName} from Firebase Storage`
    );
  }
};
