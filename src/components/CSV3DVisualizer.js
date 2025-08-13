import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Instances, Instance } from "@react-three/drei";
import * as THREE from "three";
import Papa from "papaparse";
import {
  Cube,
  Palette,
  Database,
  Mouse,
  MagnifyingGlass,
  ChartLine,
  Question,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";

// Optimized Point component for individual data points (for small datasets)
function DataPoint({ position, intensity, color, geometryDetail = 8 }) {
  const meshRef = useRef();

  // Only animate to reduce CPU usage
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} scale={1}>
        <sphereGeometry args={[0.025, geometryDetail, geometryDetail]} />
        <meshStandardMaterial
          color={color}
          emissive="#000000"
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  );
}

// High-performance instanced point component for large datasets
function InstancedPoints({
  data,
  colorMode,
  performanceMode,
  intensityChannel,
}) {
  const instancesRef = useRef();

  // Create geometry and material once
  const geometry = useMemo(() => new THREE.SphereGeometry(0.025, 2, 2), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial(), []);

  // Create colors array for all points - optimized
  const colors = useMemo(() => {
    const colorsArray = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const color = new THREE.Color();
      const intensity = data[i].normalizedIntensity;
      if (colorMode === "intensity") {
        color.setHSL(intensity, 0.8, 0.5);
      } else {
        color.setHSL(0, 0, 0.8); // Gray/white color
      }
      colorsArray[i] = color;
    }
    return colorsArray;
  }, [data, colorMode]);

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

// Main visualization component
function CSVVisualization({
  data,
  colorMode,
  performanceMode,
  intensityChannel,
}) {
  const groupRef = useRef();

  // Performance optimization based on dataset size
  const getPerformanceSettings = (dataLength, mode = "auto") => {
    if (mode === "high") {
      return {
        geometryDetail: 8,
        sampleRate: 1, // Show all points
        useInstancing: dataLength > 5000,
      };
    } else if (mode === "low") {
      return {
        geometryDetail: 4,
        sampleRate: 0.1, // Show 10% of points
        useInstancing: dataLength > 5000,
      };
    } else {
      // Auto mode - optimized for large datasets
      if (dataLength <= 1000) {
        return {
          geometryDetail: 8,
          sampleRate: 1, // Show all points
          useInstancing: false,
        };
      } else if (dataLength <= 5000) {
        return {
          geometryDetail: 6,
          sampleRate: 1, // Show all points
          useInstancing: false,
        };
      } else {
        return {
          geometryDetail: 4,
          sampleRate: 1, // Show all points with instancing
          useInstancing: true,
        };
      }
    }
  };

  const performanceSettings = getPerformanceSettings(
    data.length,
    performanceMode
  );

  // Optimized normalize data for better visualization
  const normalizeData = (data, channel = "channel_2") => {
    // Single pass to find min/max values
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;
    let minIntensity = Infinity,
      maxIntensity = -Infinity;

    // Determine which intensity channel to use
    const getIntensityValue = (d) => {
      switch (channel) {
        case "channel_0":
          return d.mean_intensity_0;
        case "channel_1":
          return d.mean_intensity_1;
        case "channel_2":
        default:
          return d.mean_intensity_2;
      }
    };

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      minX = Math.min(minX, d.centroid_x);
      maxX = Math.max(maxX, d.centroid_x);
      minY = Math.min(minY, d.centroid_y);
      maxY = Math.max(maxY, d.centroid_y);
      minZ = Math.min(minZ, d.centroid_z);
      maxZ = Math.max(maxZ, d.centroid_z);
      const intensityValue = getIntensityValue(d);
      minIntensity = Math.min(minIntensity, intensityValue);
      maxIntensity = Math.max(maxIntensity, intensityValue);
    }

    const xRange = maxX - minX;
    const yRange = maxY - minY;
    const zRange = maxZ - minZ;
    const intensityRange = maxIntensity - minIntensity;

    // Pre-calculate normalization factors
    const xFactor = 20 / xRange;
    const yFactor = 20 / yRange;
    const zFactor = 20 / zRange;
    const intensityFactor = 1 / intensityRange;

    return data.map((row) => ({
      ...row,
      normalizedX: (row.centroid_x - minX) * xFactor - 10,
      normalizedY: (row.centroid_y - minY) * yFactor - 10,
      normalizedZ: (row.centroid_z - minZ) * zFactor - 10,
      normalizedIntensity:
        (getIntensityValue(row) - minIntensity) * intensityFactor,
    }));
  };

  const normalizedData = normalizeData(data, intensityChannel);

  const getColor = (intensity, mode) => {
    switch (mode) {
      case "intensity":
        return new THREE.Color().setHSL(intensity, 0.8, 0.5);
      default:
        return new THREE.Color().setHSL(0, 0, 0.8); // Gray/white color
    }
  };

  // Use instanced rendering for large datasets
  if (performanceSettings.useInstancing) {
    return (
      <group ref={groupRef}>
        <InstancedPoints
          data={normalizedData}
          colorMode={colorMode}
          performanceMode={performanceMode}
          intensityChannel={intensityChannel}
        />
      </group>
    );
  }

  // Use individual points for smaller datasets
  return (
    <group ref={groupRef}>
      {normalizedData.map((point, index) => (
        <DataPoint
          key={index}
          position={[point.normalizedX, point.normalizedY, point.normalizedZ]}
          intensity={point.mean_intensity_2}
          color={getColor(point.normalizedIntensity, colorMode)}
          geometryDetail={performanceSettings.geometryDetail}
        />
      ))}
    </group>
  );
}

// Main component
function CSV3DVisualizer() {
  const [data, setData] = useState([]);
  const [colorMode, setColorMode] = useState("intensity");
  const [intensityChannel, setIntensityChannel] = useState("channel_2");
  const [loading, setLoading] = useState(true);
  const [, setDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("sampled_50");
  const [performanceMode] = useState("auto");
  const [intensityFilter, setIntensityFilter] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tooltipInfo, setTooltipInfo] = useState({
    show: false,
    text: "",
    x: 0,
    y: 0,
  });

  // Available CSV files
  const csvFiles = useMemo(
    () => [
      {
        id: "sampled_50",
        name: "50 Observations",
        file: "sampled_50_observations.csv",
      },
      {
        id: "sampled_500",
        name: "500 Observations",
        file: "sampled_500_observations.csv",
      },
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
    ],
    []
  );

  // Tooltip helper functions
  const showTooltip = (text, event) => {
    setTooltipInfo({
      show: true,
      text,
      x: event.clientX + 10,
      y: event.clientY - 10,
    });
  };

  const hideTooltip = () => {
    setTooltipInfo({ show: false, text: "", x: 0, y: 0 });
  };

  // Function to randomly sample data points
  const sampleData = (data, sampleSize) => {
    if (data.length <= sampleSize) return data;

    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, sampleSize);
  };

  const loadSampleData = useCallback(async () => {
    try {
      setLoading(true);
      const activeFile = csvFiles.find((file) => file.id === activeTab);
      const response = await fetch(`/${activeFile.file}`);
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

      // For 500,000 observations, randomly sample 75,000 points
      if (activeTab === "sampled_500000") {
        parsedData = sampleData(parsedData, 100000);
      }

      setData(parsedData);
      setDataLoaded(true);
      // Keep loading true for a bit longer to ensure smooth transition
      setTimeout(() => setLoading(false), 200);
    } catch (error) {
      console.error("Error loading sample data:", error);
      setDataLoaded(true);
      setTimeout(() => setLoading(false), 200);
    }
  }, [activeTab, csvFiles, setDataLoaded]);

  useEffect(() => {
    // Load sample data by default
    loadSampleData();
  }, [loadSampleData]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setLoading(true);
    setDataLoaded(false);
  };

  // Filter data based on intensity
  const filteredData = useMemo(() => {
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
  }, [data, intensityFilter, intensityChannel]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#000",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "40px",
            height: "40px",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              borderTop: "2px solid #fff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Tooltip */}
      {tooltipInfo.show && (
        <div
          style={{
            position: "fixed",
            left: tooltipInfo.x,
            top: tooltipInfo.y,
            zIndex: 10000,
            background: "rgba(0, 0, 0, 0.95)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            maxWidth: "300px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
            pointerEvents: "none",
          }}
        >
          {tooltipInfo.text}
        </div>
      )}

      {/* Controls Panel */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          zIndex: 1000,
          background: "rgba(0, 0, 0, 0.95)",
          backdropFilter: "blur(10px)",
          color: "white",
          padding: sidebarCollapsed ? "12px" : "24px",
          borderRadius: "12px",
          width: sidebarCollapsed ? "60px" : "280px",
          height: sidebarCollapsed ? "60px" : "auto",
          border: "1px solid #333333",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          transition: "all 0.3s ease",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "space-between",
            marginBottom: sidebarCollapsed ? "0" : "20px",
          }}
        >
          {!sidebarCollapsed && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "opacity 0.3s ease",
              }}
            >
              <h3
                style={{
                  margin: "0",
                  fontSize: "18px",
                  fontWeight: "500",
                  letterSpacing: "0.5px",
                }}
              >
                Filters
              </h3>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s ease",
              minWidth: "32px",
              minHeight: "32px",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            {sidebarCollapsed ? (
              <CaretRight size={20} />
            ) : (
              <CaretLeft size={20} />
            )}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div
            style={{
              marginBottom: "20px",
              transition: "opacity 0.3s ease",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "8px",
                fontSize: "13px",
                fontWeight: "500",
                opacity: "0.9",
              }}
            >
              <Palette size={14} />
              Color Mode
              <Question
                size={12}
                style={{ cursor: "pointer", opacity: "0.6" }}
                onMouseEnter={(e) =>
                  showTooltip(
                    "Choose how data points are colored. Intensity-based uses the selected channel's values to create a color gradient, while Uniform gives all points the same color.",
                    e
                  )
                }
                onMouseLeave={hideTooltip}
              />
            </label>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <button
                onClick={() => setColorMode("intensity")}
                style={{
                  padding: "10px 12px",
                  background:
                    colorMode === "intensity"
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.03)",
                  color: "white",
                  border:
                    colorMode === "intensity"
                      ? "1px solid rgba(255, 255, 255, 0.2)"
                      : "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  fontWeight: colorMode === "intensity" ? "500" : "400",
                }}
                onMouseEnter={(e) => {
                  if (colorMode !== "intensity") {
                    e.target.style.background = "rgba(255, 255, 255, 0.08)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (colorMode !== "intensity") {
                    e.target.style.background = "rgba(255, 255, 255, 0.03)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.05)";
                  }
                }}
              >
                Intensity-based
              </button>
              <button
                onClick={() => setColorMode("uniform")}
                style={{
                  padding: "10px 12px",
                  background:
                    colorMode === "uniform"
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.03)",
                  color: "white",
                  border:
                    colorMode === "uniform"
                      ? "1px solid rgba(255, 255, 255, 0.2)"
                      : "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  fontWeight: colorMode === "uniform" ? "500" : "400",
                }}
                onMouseEnter={(e) => {
                  if (colorMode !== "uniform") {
                    e.target.style.background = "rgba(255, 255, 255, 0.08)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (colorMode !== "uniform") {
                    e.target.style.background = "rgba(255, 255, 255, 0.03)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.05)";
                  }
                }}
              >
                Uniform
              </button>
            </div>
          </div>
        )}

        {!sidebarCollapsed && (
          <div
            style={{
              marginBottom: "20px",
              transition: "opacity 0.3s ease",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "8px",
                fontSize: "13px",
                fontWeight: "500",
                opacity: "0.9",
              }}
            >
              <ChartLine size={14} />
              Intensity Channel
              <Question
                size={12}
                style={{ cursor: "pointer", opacity: "0.6" }}
                onMouseEnter={(e) =>
                  showTooltip(
                    "Select which intensity measurement to use for coloring and filtering. Each channel represents different measurements from the dataset (mean_intensity_0, mean_intensity_1, or mean_intensity_2).",
                    e
                  )
                }
                onMouseLeave={hideTooltip}
              />
            </label>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <button
                onClick={() => setIntensityChannel("channel_0")}
                style={{
                  padding: "10px 12px",
                  background:
                    intensityChannel === "channel_0"
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.03)",
                  color: "white",
                  border:
                    intensityChannel === "channel_0"
                      ? "1px solid rgba(255, 255, 255, 0.2)"
                      : "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  fontWeight: intensityChannel === "channel_0" ? "500" : "400",
                }}
                onMouseEnter={(e) => {
                  if (intensityChannel !== "channel_0") {
                    e.target.style.background = "rgba(255, 255, 255, 0.08)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (intensityChannel !== "channel_0") {
                    e.target.style.background = "rgba(255, 255, 255, 0.03)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.05)";
                  }
                }}
              >
                Channel 0 (mean_intensity_0)
              </button>
              <button
                onClick={() => setIntensityChannel("channel_1")}
                style={{
                  padding: "10px 12px",
                  background:
                    intensityChannel === "channel_1"
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.03)",
                  color: "white",
                  border:
                    intensityChannel === "channel_1"
                      ? "1px solid rgba(255, 255, 255, 0.2)"
                      : "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  fontWeight: intensityChannel === "channel_1" ? "500" : "400",
                }}
                onMouseEnter={(e) => {
                  if (intensityChannel !== "channel_1") {
                    e.target.style.background = "rgba(255, 255, 255, 0.08)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (intensityChannel !== "channel_1") {
                    e.target.style.background = "rgba(255, 255, 255, 0.03)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.05)";
                  }
                }}
              >
                Channel 1 (mean_intensity_1)
              </button>
              <button
                onClick={() => setIntensityChannel("channel_2")}
                style={{
                  padding: "10px 12px",
                  background:
                    intensityChannel === "channel_2"
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.03)",
                  color: "white",
                  border:
                    intensityChannel === "channel_2"
                      ? "1px solid rgba(255, 255, 255, 0.2)"
                      : "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  fontWeight: intensityChannel === "channel_2" ? "500" : "400",
                }}
                onMouseEnter={(e) => {
                  if (intensityChannel !== "channel_2") {
                    e.target.style.background = "rgba(255, 255, 255, 0.08)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (intensityChannel !== "channel_2") {
                    e.target.style.background = "rgba(255, 255, 255, 0.03)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.05)";
                  }
                }}
              >
                Channel 2 (mean_intensity_2)
              </button>
            </div>
          </div>
        )}

        {!sidebarCollapsed && (
          <div
            style={{
              marginBottom: "20px",
              transition: "opacity 0.3s ease",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "8px",
                fontSize: "13px",
                fontWeight: "500",
                opacity: "0.9",
              }}
            >
              <MagnifyingGlass size={14} />
              Intensity Filter
              <Question
                size={12}
                style={{ cursor: "pointer", opacity: "0.6" }}
                onMouseEnter={(e) =>
                  showTooltip(
                    "Filter data points based on their intensity values. Low shows the bottom 33%, Medium shows the middle 33%, and High shows the top 33% of intensity values from the selected channel.",
                    e
                  )
                }
                onMouseLeave={hideTooltip}
              />
            </label>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <button
                onClick={() => setIntensityFilter("all")}
                style={{
                  padding: "10px 12px",
                  background:
                    intensityFilter === "all"
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.03)",
                  color: "white",
                  border:
                    intensityFilter === "all"
                      ? "1px solid rgba(255, 255, 255, 0.2)"
                      : "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  fontWeight: intensityFilter === "all" ? "500" : "400",
                }}
                onMouseEnter={(e) => {
                  if (intensityFilter !== "all") {
                    e.target.style.background = "rgba(255, 255, 255, 0.08)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (intensityFilter !== "all") {
                    e.target.style.background = "rgba(255, 255, 255, 0.03)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.05)";
                  }
                }}
              >
                All Intensities
              </button>
              <button
                onClick={() => setIntensityFilter("low")}
                style={{
                  padding: "10px 12px",
                  background:
                    intensityFilter === "low"
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.03)",
                  color: "white",
                  border:
                    intensityFilter === "low"
                      ? "1px solid rgba(255, 255, 255, 0.2)"
                      : "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  fontWeight: intensityFilter === "low" ? "500" : "400",
                }}
                onMouseEnter={(e) => {
                  if (intensityFilter !== "low") {
                    e.target.style.background = "rgba(255, 255, 255, 0.08)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (intensityFilter !== "low") {
                    e.target.style.background = "rgba(255, 255, 255, 0.03)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.05)";
                  }
                }}
              >
                Low Intensity
              </button>
              <button
                onClick={() => setIntensityFilter("medium")}
                style={{
                  padding: "10px 12px",
                  background:
                    intensityFilter === "medium"
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.03)",
                  color: "white",
                  border:
                    intensityFilter === "medium"
                      ? "1px solid rgba(255, 255, 255, 0.2)"
                      : "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  fontWeight: intensityFilter === "medium" ? "500" : "400",
                }}
                onMouseEnter={(e) => {
                  if (intensityFilter !== "medium") {
                    e.target.style.background = "rgba(255, 255, 255, 0.08)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (intensityFilter !== "medium") {
                    e.target.style.background = "rgba(255, 255, 255, 0.03)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.05)";
                  }
                }}
              >
                Medium Intensity
              </button>
              <button
                onClick={() => setIntensityFilter("high")}
                style={{
                  padding: "10px 12px",
                  background:
                    intensityFilter === "high"
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.03)",
                  color: "white",
                  border:
                    intensityFilter === "high"
                      ? "1px solid rgba(255, 255, 255, 0.2)"
                      : "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  fontWeight: intensityFilter === "high" ? "500" : "400",
                }}
                onMouseEnter={(e) => {
                  if (intensityFilter !== "high") {
                    e.target.style.background = "rgba(255, 255, 255, 0.08)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (intensityFilter !== "high") {
                    e.target.style.background = "rgba(255, 255, 255, 0.03)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.05)";
                  }
                }}
              >
                High Intensity
              </button>
            </div>
          </div>
        )}

        {!sidebarCollapsed && (
          <div
            style={{
              marginBottom: "20px",
              transition: "opacity 0.3s ease",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "8px",
                fontSize: "13px",
                fontWeight: "500",
                opacity: "0.9",
              }}
            >
              <Database size={14} />
              Dataset
              <Question
                size={12}
                style={{ cursor: "pointer", opacity: "0.6" }}
                onMouseEnter={(e) =>
                  showTooltip(
                    "Select different dataset sizes to explore. Larger datasets show more data points but may require more processing time. The 500k dataset automatically samples 100k points for optimal performance.",
                    e
                  )
                }
                onMouseLeave={hideTooltip}
              />
            </label>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {csvFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => handleTabChange(file.id)}
                  style={{
                    padding: "10px 12px",
                    background:
                      activeTab === file.id
                        ? "rgba(255, 255, 255, 0.15)"
                        : "rgba(255, 255, 255, 0.03)",
                    color: "white",
                    border:
                      activeTab === file.id
                        ? "1px solid rgba(255, 255, 255, 0.2)"
                        : "1px solid rgba(255, 255, 255, 0.05)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    fontWeight: activeTab === file.id ? "500" : "400",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== file.id) {
                      e.target.style.background = "rgba(255, 255, 255, 0.08)";
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== file.id) {
                      e.target.style.background = "rgba(255, 255, 255, 0.03)";
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.05)";
                    }
                  }}
                >
                  {file.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {!sidebarCollapsed && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              padding: "16px",
              borderRadius: "8px",
              marginTop: "16px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              transition: "opacity 0.3s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                marginBottom: "8px",
                opacity: "0.8",
              }}
            >
              <ChartLine size={14} />
              Current Dataset
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "4px",
              }}
            >
              {csvFiles.find((file) => file.id === activeTab)?.name}
            </div>
            <div style={{ fontSize: "13px", opacity: "0.7" }}>
              <strong>{filteredData.length.toLocaleString()}</strong> points
              {intensityFilter !== "all" && (
                <span style={{ opacity: "0.6" }}>
                  {" "}
                  (filtered from {data.length.toLocaleString()})
                </span>
              )}
            </div>
          </div>
        )}

        {!sidebarCollapsed && (
          <div
            style={{
              fontSize: "12px",
              marginTop: "16px",
              opacity: "0.6",
              padding: "12px",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.03)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: "500",
                marginBottom: "8px",
              }}
            >
              <Mouse size={14} />
              Controls
              <Question
                size={12}
                style={{ cursor: "pointer", opacity: "0.6" }}
                onMouseEnter={(e) =>
                  showTooltip(
                    "Mouse controls for navigating the 3D visualization. Drag to rotate the view around the data points, and scroll to zoom in and out.",
                    e
                  )
                }
                onMouseLeave={hideTooltip}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "2px",
              }}
            >
              Mouse: Rotate view
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Scroll: Zoom
            </div>
          </div>
        )}
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [15, 15, 15], fov: 60 }}
        style={{ background: "#000" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <CSVVisualization
          data={filteredData}
          colorMode={colorMode}
          performanceMode={performanceMode}
          intensityChannel={intensityChannel}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          dampingFactor={0.05}
        />

        {/* Axes */}
        <axesHelper args={[5]} />
      </Canvas>
    </div>
  );
}

export default CSV3DVisualizer;
