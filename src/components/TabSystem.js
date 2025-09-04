import React from "react";
import { Routes, Route } from "react-router-dom";
import SampledFiltersVisualizer from "./SampledFiltersVisualizer";
import "./TabSystem.css";

// Main Tab System Component
function TabSystem() {
  return (
    <div className="tab-system">
      <div className="tab-content">
        <Routes>
          <Route
            path="/"
            element={<SampledFiltersVisualizer sampleSize={5000} />}
          />
          <Route
            path="/25k"
            element={<SampledFiltersVisualizer sampleSize={25000} />}
          />
          <Route
            path="/50k"
            element={<SampledFiltersVisualizer sampleSize={50000} />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default TabSystem;
