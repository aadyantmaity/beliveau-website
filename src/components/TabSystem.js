import React from "react";
import { Routes, Route } from "react-router-dom";
import CSV3DVisualizer from "./CSV3DVisualizerRefactored";
import AllFeaturesVisualizer from "./AllFeaturesVisualizer";
import "./TabSystem.css";

// Main Tab System Component
function TabSystem() {
  return (
    <div className="tab-system">
      <div className="tab-content">
        <Routes>
          <Route
            path="/5k"
            element={<CSV3DVisualizer datasetId="sampled_5000_observations" />}
          />
          <Route
            path="/50k"
            element={<CSV3DVisualizer datasetId="sampled_50000" />}
          />
          <Route
            path="/500k"
            element={<CSV3DVisualizer datasetId="sampled_500000" />}
          />
          <Route path="/all-features" element={<AllFeaturesVisualizer />} />
          <Route
            path="/"
            element={<CSV3DVisualizer datasetId="sampled_5000_observations" />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default TabSystem;
