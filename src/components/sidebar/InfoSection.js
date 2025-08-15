import React from "react";
import { ChartLine } from "@phosphor-icons/react";

function InfoSection({
  datasetName,
  filteredData,
  data,
  intensityFilter,
  selectedMagnitudes = [],
  selectedCosines = [],
  sidebarCollapsed,
  filtering = false,
}) {
  if (sidebarCollapsed) return null;

  return (
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
      <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
        {datasetName}
      </div>
      <div style={{ fontSize: "13px", opacity: "0.7" }}>
        {filtering ? (
          <span style={{ color: "#4A90E2" }}>Filtering...</span>
        ) : (
          <>
            <strong>{filteredData.length.toLocaleString()}</strong> points
            {(intensityFilter !== "all" ||
              selectedMagnitudes.length > 0 ||
              selectedCosines.length > 0) && (
              <span style={{ opacity: "0.6" }}>
                {" "}
                (filtered from {data.length.toLocaleString()})
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default InfoSection;
