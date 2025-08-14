import React from "react";
import { ChartLine } from "@phosphor-icons/react";

function InfoSection({
  csvFiles,
  activeTab,
  filteredData,
  data,
  intensityFilter,
  sidebarCollapsed,
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
      <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
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
  );
}

export default InfoSection;
