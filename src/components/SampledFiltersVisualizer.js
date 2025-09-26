import React, { useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";

// Import visualization components
import CSVVisualization from "./visualization/CSVVisualization";

// Import sidebar components
import SidebarHeader from "./sidebar/SidebarHeader";
import CellStateFilterSection from "./sidebar/CellStateFilterSection";
import AnatomyScoreFilterSection from "./sidebar/AnatomyScoreFilterSection";
import PCFilterSection from "./sidebar/PCFilterSection";
import SomiteStageFilterSection from "./sidebar/SomiteStageFilterSection";
// import InfoSection from "./sidebar/InfoSection";

// Import utilities
import {
  loadUpdatedFiltersDataFromFirebase,
  sampleData,
} from "../utils/dataLoader";
import {
  filterDataByAnatomyScore,
  markPCFilteredPoints,
  markCellStateSelection,
  clearPercentileCache,
} from "../utils/dataFilter";

// Main component
function SampledFiltersVisualizer({ sampleSize = 5000 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
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


  // Somite stage filter state
  const [selectedSomiteStages, setSelectedSomiteStages] = useState([]);

  // PC filter state
  const [pcFilters, setPCFilters] = useState({});

  // Color mode state
  const [colorMode] = useState("cellState");

  // Determine which filter is currently active
  const getActiveFilter = () => {
    if (selectedSomiteStages.length > 0) return "somite";
    if (anatomyHighlightMode !== "none") return "anatomy";
    if (Object.values(pcFilters).some(filter => filter.active)) return "pc";
    return "none";
  };

  const activeFilter = getActiveFilter();

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
        "data_with_anatomy_colors.csv"
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
      selectedAnatomyScores.length > 0 ||
      Object.keys(pcFilters).length > 0;

    console.log("Filter check - hasActiveFilters:", hasActiveFilters);
    console.log("PC filters state:", pcFilters);
    console.log("PC filters keys:", Object.keys(pcFilters));

    // Use requestAnimationFrame to prevent blocking the UI
    const filterData = () => {
      let filtered = data;

      // Apply cell state marking instead of filtering
      filtered = markCellStateSelection(filtered, selectedCellStates);

      // Apply anatomy score filters
      if (selectedAnatomyScores.length > 0) {
        filtered = filterDataByAnatomyScore(
          filtered,
          selectedAnatomyScores,
          anatomyScorePercentiles
        );
      }

      // Apply PC filter marking instead of filtering
      if (Object.keys(pcFilters).length > 0) {
        console.log("Applying PC filter marking in main component");
        filtered = markPCFilteredPoints(filtered, pcFilters);
      }

      // Note: Somite ID and Somite Stage filtering are now handled in visualization coloring, not data filtering

      setFilteredData(filtered);
    };

    // Use requestAnimationFrame to prevent blocking the UI
    requestAnimationFrame(filterData);
  }, [
    data,
    selectedCellStates,
    selectedAnatomyScores,
    anatomyScorePercentiles,
    pcFilters,
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
            {/* Active Filter Display */}
            {activeFilter !== "none" && (
              <div
                style={{
                  background: "rgba(76, 175, 80, 0.1)",
                  border: "1px solid rgba(76, 175, 80, 0.3)",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "16px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "12px", color: "#4CAF50", fontWeight: "600", marginBottom: "4px" }}>
                  Active Filter
                </div>
                <div style={{ fontSize: "14px", color: "white", fontWeight: "500" }}>
                  {activeFilter === "somite" && "Somite Stage"}
                  {activeFilter === "anatomy" && "Anatomy"}
                  {activeFilter === "pc" && "Principal Component"}
                </div>
              </div>
            )}

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
              disabled={activeFilter !== "none" && activeFilter !== "anatomy"}
            />

            <PCFilterSection
              pcFilters={pcFilters}
              setPCFilters={setPCFilters}
              sidebarCollapsed={sidebarCollapsed}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              disabled={activeFilter !== "none" && activeFilter !== "pc"}
            />


            <SomiteStageFilterSection
              selectedSomiteStages={selectedSomiteStages}
              setSelectedSomiteStages={setSelectedSomiteStages}
              sidebarCollapsed={sidebarCollapsed}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              disabled={activeFilter !== "none" && activeFilter !== "somite"}
            />

            {/* <InfoSection
              datasetName={`${(sampleSize / 1000).toFixed(0)}K Dataset`}
              filteredData={filteredData}
              data={data}
              intensityFilter="all"
              selectedMagnitudes={[]}
              selectedCosines={[]}
              sidebarCollapsed={sidebarCollapsed}
              filtering={filtering}
            /> */}
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
          selectedSomiteStages={selectedSomiteStages}
          selectedCellStates={selectedCellStates}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          dampingFactor={0.05}
        />

        {/* Axes - Top Right */}
        <axesHelper args={[2]} position={[8, 8, 8]} />
        
        {/* Axis Labels */}
        <Text
          position={[10.5, 8, 8]}
          fontSize={0.3}
          color="#ff0000"
          anchorX="center"
          anchorY="middle"
        >
          X
        </Text>
        <Text
          position={[8, 10.5, 8]}
          fontSize={0.3}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          Y
        </Text>
        <Text
          position={[8, 8, 10.5]}
          fontSize={0.3}
          color="#0000ff"
          anchorX="center"
          anchorY="middle"
        >
          Z
        </Text>
      </Canvas>
    </div>
  );
}

export default SampledFiltersVisualizer;
