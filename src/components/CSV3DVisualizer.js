import React, { useState, useRef, useEffect, useMemo } from "react";
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
  CaretDown,
  ChartLine,
  Info,
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
function InstancedPoints({ data, colorMode, performanceMode }) {
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
function CSVVisualization({ data, colorMode, performanceMode }) {
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
  const normalizeData = (data) => {
    // Single pass to find min/max values
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;
    let minIntensity = Infinity,
      maxIntensity = -Infinity;

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      minX = Math.min(minX, d.centroid_x);
      maxX = Math.max(maxX, d.centroid_x);
      minY = Math.min(minY, d.centroid_y);
      maxY = Math.max(maxY, d.centroid_y);
      minZ = Math.min(minZ, d.centroid_z);
      maxZ = Math.max(maxZ, d.centroid_z);
      minIntensity = Math.min(minIntensity, d.mean_intensity_2);
      maxIntensity = Math.max(maxIntensity, d.mean_intensity_2);
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
        (row.mean_intensity_2 - minIntensity) * intensityFactor,
    }));
  };

  const normalizedData = normalizeData(data);

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
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("sampled_50");
  const [performanceMode, setPerformanceMode] = useState("auto");

  // Available CSV files
  const csvFiles = [
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
  ];

  useEffect(() => {
    // Load sample data by default
    loadSampleData();
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setLoading(true);
    setDataLoaded(false);
  };

  // Function to randomly sample data points
  const sampleData = (data, sampleSize) => {
    if (data.length <= sampleSize) return data;

    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, sampleSize);
  };

  const loadSampleData = async () => {
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
        parsedData = sampleData(parsedData, 75000);
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
  };

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
      {/* Controls Panel */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          zIndex: 1000,
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(10px)",
          color: "white",
          padding: "24px",
          borderRadius: "12px",
          minWidth: "280px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          <Cube size={20} weight="fill" />
          <h3
            style={{
              margin: "0",
              fontSize: "18px",
              fontWeight: "500",
              letterSpacing: "0.5px",
            }}
          >
            Beliveau 3D Visualizer
          </h3>
        </div>

        <div style={{ marginBottom: "20px" }}>
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
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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

        <div style={{ marginBottom: "20px" }}>
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
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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

        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            padding: "16px",
            borderRadius: "8px",
            marginTop: "16px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
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
            style={{ fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}
          >
            {csvFiles.find((file) => file.id === activeTab)?.name}
            {activeTab === "sampled_500000" && (
              <span
                style={{ fontSize: "12px", opacity: "0.6", fontWeight: "400" }}
              >
                {" "}
                (75k random sample)
              </span>
            )}
          </div>
          <div style={{ fontSize: "13px", opacity: "0.7" }}>
            <strong>{data.length.toLocaleString()}</strong> points
          </div>
        </div>

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
          data={data}
          colorMode={colorMode}
          performanceMode={performanceMode}
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
