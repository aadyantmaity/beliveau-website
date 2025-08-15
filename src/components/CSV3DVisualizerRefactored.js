import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// Import visualization components
import CSVVisualization from "./visualization/CSVVisualization";

// Import sidebar components
import SidebarHeader from "./sidebar/SidebarHeader";
import ColorModeSection from "./sidebar/ColorModeSection";
import IntensityChannelSection from "./sidebar/IntensityChannelSection";
import IntensityFilterSection from "./sidebar/IntensityFilterSection";
import InfoSection from "./sidebar/InfoSection";

// Import utilities
import {
  loadCSVDataFromFirebase,
  sampleData,
  csvFiles,
} from "../utils/dataLoader";
import { filterDataByIntensity } from "../utils/dataFilter";

// Main component
function CSV3DVisualizer({ datasetId = "sampled_5000" }) {
  const [data, setData] = useState([]);
  const [colorMode, setColorMode] = useState("intensity");
  const [intensityChannel, setIntensityChannel] = useState("channel_2");
  const [loading, setLoading] = useState(true);
  const [, setDataLoaded] = useState(false);
  const [performanceMode] = useState("auto");
  const [intensityFilter, setIntensityFilter] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tooltipInfo, setTooltipInfo] = useState({
    show: false,
    text: "",
    x: 0,
    y: 0,
  });

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

  const loadSampleData = useCallback(async () => {
    try {
      setLoading(true);
      const activeFile = csvFiles.find((file) => file.id === datasetId);
      let parsedData = await loadCSVDataFromFirebase(activeFile.file);

      // For 500,000 observations, randomly sample 100,000 points
      if (datasetId === "sampled_500000") {
        parsedData = sampleData(parsedData, 100000);
      }

      setData(parsedData);
      setDataLoaded(true);
      // Keep loading true for a bit longer to ensure smooth transition
      setTimeout(() => setLoading(false), 200);
    } catch (error) {
      console.error("Error loading sample data from Firebase Storage:", error);
      setDataLoaded(true);
      setTimeout(() => setLoading(false), 200);
    }
  }, [datasetId, setDataLoaded]);

  useEffect(() => {
    // Load sample data by default
    loadSampleData();
  }, [loadSampleData]);

  // Filter data based on intensity
  const filteredData = useMemo(() => {
    return filterDataByIntensity(data, intensityFilter, intensityChannel);
  }, [data, intensityFilter, intensityChannel]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 72px)",
          background: "#000",
          position: "absolute",
          top: "72px",
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "3px solid rgba(255, 255, 255, 0.1)",
            borderTop: "3px solid #fff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
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
          padding: sidebarCollapsed ? "12px" : "0",
          borderRadius: "12px",
          width: sidebarCollapsed ? "60px" : "320px",
          height: sidebarCollapsed ? "60px" : "calc(100vh - 120px)",
          border: "1px solid #333333",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SidebarHeader
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        {!sidebarCollapsed && (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "0 24px 32px 24px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
            }}
            className="sidebar-scroll"
          >
            <ColorModeSection
              colorMode={colorMode}
              setColorMode={setColorMode}
              sidebarCollapsed={sidebarCollapsed}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            />

            <IntensityChannelSection
              intensityChannel={intensityChannel}
              setIntensityChannel={setIntensityChannel}
              sidebarCollapsed={sidebarCollapsed}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            />

            <IntensityFilterSection
              intensityFilter={intensityFilter}
              setIntensityFilter={setIntensityFilter}
              sidebarCollapsed={sidebarCollapsed}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            />

            <InfoSection
              datasetName={
                csvFiles.find((file) => file.id === datasetId)?.name ||
                "Unknown Dataset"
              }
              filteredData={filteredData}
              data={data}
              intensityFilter={intensityFilter}
              selectedMagnitudes={[]}
              selectedCosines={[]}
              sidebarCollapsed={sidebarCollapsed}
            />
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
