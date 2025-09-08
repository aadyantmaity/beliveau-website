import React, { useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// Import visualization components
import CSVVisualization from "./visualization/CSVVisualization";

// Import sidebar components
import SidebarHeader from "./sidebar/SidebarHeader";
import CellStateFilterSection from "./sidebar/CellStateFilterSection";
import AnatomyScoreFilterSection from "./sidebar/AnatomyScoreFilterSection";
import SomiteIdFilterSection from "./sidebar/SomiteIdFilterSection";
import SomiteStageFilterSection from "./sidebar/SomiteStageFilterSection";
import InfoSection from "./sidebar/InfoSection";

// Import utilities
import {
  loadUpdatedFiltersDataFromFirebase,
  sampleData,
} from "../utils/dataLoader";
import {
  filterDataByCellState,
  filterDataByAnatomyScore,
  clearPercentileCache,
} from "../utils/dataFilter";

// Main component
function SampledFiltersVisualizer({ sampleSize = 5000 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tooltipInfo, setTooltipInfo] = useState({
    show: false,
    text: "",
    x: 0,
    y: 0,
  });

  // Cell state filter state
  const [selectedCellStates, setSelectedCellStates] = useState([]);

  // Anatomy score filter state
  const [selectedAnatomyScores, setSelectedAnatomyScores] = useState([]);
  const [anatomyScorePercentiles, setAnatomyScorePercentiles] = useState({
    Anterior_Posterior: "all",
    Dorsal_Ventral_Score: "all",
    Left_Right_Score: "all",
  });
  const [anatomyHighlightMode, setAnatomyHighlightMode] = useState("none");

  // Somite ID filter state
  const [selectedSomiteIds, setSelectedSomiteIds] = useState([]);

  // Somite stage filter state
  const [selectedSomiteStages, setSelectedSomiteStages] = useState([]);

  // Color mode state
  const [colorMode] = useState("cellState");

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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const fullData = await loadUpdatedFiltersDataFromFirebase(
        "306_data_50.csv"
      );

      // Sample the data based on the sampleSize prop
      const sampledData = sampleData(fullData, sampleSize);
      setData(sampledData);

      // Clear percentile cache when new data is loaded
      clearPercentileCache();
      setTimeout(() => setLoading(false), 200);
    } catch (error) {
      console.error("Error loading sampled filters data:", error);
      setTimeout(() => setLoading(false), 200);
    }
  }, [sampleSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter data based on all filters
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (data.length === 0) {
      setFilteredData([]);
      return;
    }

    // Skip all filtering if no filters are applied (excluding somite IDs and somite stages which are used for coloring)
    const hasActiveFilters =
      selectedCellStates.length > 0 || selectedAnatomyScores.length > 0;

    if (!hasActiveFilters) {
      setFilteredData(data); // Use original data directly
      setFiltering(false);
      return;
    }

    // Only run filtering if filters are active
    setFiltering(true);

    // Use requestAnimationFrame to prevent blocking the UI
    const filterData = () => {
      let filtered = data;

      // Apply cell state filters
      if (selectedCellStates.length > 0) {
        filtered = filterDataByCellState(filtered, selectedCellStates);
      }

      // Apply anatomy score filters
      if (selectedAnatomyScores.length > 0) {
        filtered = filterDataByAnatomyScore(
          filtered,
          selectedAnatomyScores,
          anatomyScorePercentiles
        );
      }

      // Note: Somite ID and Somite Stage filtering are now handled in visualization coloring, not data filtering

      setFilteredData(filtered);
      setFiltering(false);
    };

    // Use requestAnimationFrame to prevent blocking the UI
    requestAnimationFrame(filterData);
  }, [
    data,
    selectedCellStates,
    selectedAnatomyScores,
    anatomyScorePercentiles,
    selectedSomiteIds,
  ]);

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
            <CellStateFilterSection
              selectedCellStates={selectedCellStates}
              setSelectedCellStates={setSelectedCellStates}
              sidebarCollapsed={sidebarCollapsed}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            />

            <AnatomyScoreFilterSection
              selectedAnatomyScores={selectedAnatomyScores}
              setSelectedAnatomyScores={setSelectedAnatomyScores}
              anatomyScorePercentiles={anatomyScorePercentiles}
              setAnatomyScorePercentiles={setAnatomyScorePercentiles}
              anatomyHighlightMode={anatomyHighlightMode}
              setAnatomyHighlightMode={setAnatomyHighlightMode}
              sidebarCollapsed={sidebarCollapsed}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            />

            <SomiteIdFilterSection
              selectedSomiteIds={selectedSomiteIds}
              setSelectedSomiteIds={setSelectedSomiteIds}
              selectedSomiteStages={selectedSomiteStages}
              sidebarCollapsed={sidebarCollapsed}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            />

            <SomiteStageFilterSection
              selectedSomiteStages={selectedSomiteStages}
              setSelectedSomiteStages={setSelectedSomiteStages}
              selectedSomiteIds={selectedSomiteIds}
              sidebarCollapsed={sidebarCollapsed}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            />

            <InfoSection
              datasetName={`${(sampleSize / 1000).toFixed(0)}K Dataset`}
              filteredData={filteredData}
              data={data}
              intensityFilter="all"
              selectedMagnitudes={[]}
              selectedCosines={[]}
              sidebarCollapsed={sidebarCollapsed}
              filtering={filtering}
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
          performanceMode="auto"
          intensityChannel="channel_2"
          anatomyHighlightMode={anatomyHighlightMode}
          selectedSomiteIds={selectedSomiteIds}
          selectedSomiteStages={selectedSomiteStages}
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

export default SampledFiltersVisualizer;
