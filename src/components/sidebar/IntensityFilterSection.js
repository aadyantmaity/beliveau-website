import React from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import ControlSection from "./ControlSection";
import ControlButton from "./ControlButton";

function IntensityFilterSection({
  intensityFilter,
  setIntensityFilter,
  filterLoading,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
}) {
  return (
    <ControlSection
      title="Intensity Filter"
      icon={MagnifyingGlass}
      tooltip="Filter data points based on their intensity values. Low shows the bottom 33%, Medium shows the middle 33%, and High shows the top 33% of intensity values from the selected channel."
      sidebarCollapsed={sidebarCollapsed}
      showTooltip={showTooltip}
      hideTooltip={hideTooltip}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {filterLoading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              fontSize: "12px",
              color: "#888",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                border: "1px solid #888",
                borderTop: "1px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            Filtering...
          </div>
        )}
        <ControlButton
          onClick={() => setIntensityFilter("all")}
          isActive={intensityFilter === "all"}
          disabled={filterLoading}
        >
          All Intensities
        </ControlButton>
        <ControlButton
          onClick={() => setIntensityFilter("low")}
          isActive={intensityFilter === "low"}
          disabled={filterLoading}
        >
          Low Intensity
        </ControlButton>
        <ControlButton
          onClick={() => setIntensityFilter("medium")}
          isActive={intensityFilter === "medium"}
          disabled={filterLoading}
        >
          Medium Intensity
        </ControlButton>
        <ControlButton
          onClick={() => setIntensityFilter("high")}
          isActive={intensityFilter === "high"}
          disabled={filterLoading}
        >
          High Intensity
        </ControlButton>
      </div>
    </ControlSection>
  );
}

export default IntensityFilterSection;
