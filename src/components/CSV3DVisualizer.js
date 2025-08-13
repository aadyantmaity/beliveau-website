import React, { useState, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Html,
  Instances,
  Instance,
} from "@react-three/drei";
import * as THREE from "three";
import Papa from "papaparse";

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
        <sphereGeometry args={[0.05, geometryDetail, geometryDetail]} />
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
  const geometry = useMemo(() => new THREE.SphereGeometry(0.05, 4, 4), []);
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
        color.setHSL(0.6, 0.8, 0.5);
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
        return new THREE.Color().setHSL(0.6, 0.8, 0.5);
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
  const [fileInput, setFileInput] = useState(null);
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

      // For 50,000 observations tab, render all points (optimized)
      // No sampling needed - we'll use instanced rendering for performance

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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target.result;
        const result = Papa.parse(csvText, { header: true });

        const parsedData = result.data
          .map((row) => ({
            centroid_x: parseFloat(row.centroid_x),
            centroid_y: parseFloat(row.centroid_y),
            centroid_z: parseFloat(row.centroid_z),
            mean_intensity_0: parseFloat(row["mean_intensity-0"]),
            mean_intensity_1: parseFloat(row["mean_intensity-1"]),
            mean_intensity_2: parseFloat(row["mean_intensity-2"]),
          }))
          .filter((row) => !isNaN(row.centroid_x));

        setData(parsedData);
        setDataLoaded(true);
        setTimeout(() => setLoading(false), 200);
      };
      reader.readAsText(file);
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
            width: "60px",
            height: "60px",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              border: "3px solid rgba(255, 255, 255, 0.1)",
              borderTop: "3px solid #007bff",
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
          top: "20px",
          left: "20px",
          zIndex: 1000,
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "20px",
          borderRadius: "8px",
          minWidth: "250px",
        }}
      >
        <h3 style={{ margin: "0 0 15px 0" }}>Beliveau 3D Visualizer</h3>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Color Mode:
          </label>
          <select
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value)}
            style={{ width: "100%", padding: "5px" }}
          >
            <option value="intensity">Intensity-based</option>
            <option value="uniform">Uniform</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Upload CSV:
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Dataset:
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {csvFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => handleTabChange(file.id)}
                style={{
                  padding: "6px 8px",
                  background:
                    activeTab === file.id
                      ? "#007bff"
                      : "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  textAlign: "left",
                  transition: "background 0.2s",
                }}
              >
                {file.name}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "10px",
            borderRadius: "4px",
            marginTop: "10px",
          }}
        >
          <strong>Current Dataset:</strong>
          <br />
          {csvFiles.find((file) => file.id === activeTab)?.name}
          <br />
          <strong>Points:</strong> {data.length.toLocaleString()}
          {data.length > 10000 && (
            <>
              <br />
              <strong style={{ color: "#00ff00" }}>
                Performance Mode:
              </strong>{" "}
              Instanced Rendering
              <br />
              <small style={{ opacity: 0.7 }}>
                Showing all {data.length.toLocaleString()} points with optimized
                rendering
              </small>
            </>
          )}
        </div>

        <div style={{ fontSize: "12px", marginTop: "15px", opacity: 0.7 }}>
          <strong>Controls:</strong>
          <br />
          • Mouse: Rotate view
          <br />• Scroll: Zoom
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

        {/* Grid for reference */}
        <gridHelper args={[20, 20, "#444444", "#222222"]} />

        {/* Axes */}
        <axesHelper args={[5]} />
      </Canvas>
    </div>
  );
}

export default CSV3DVisualizer;
