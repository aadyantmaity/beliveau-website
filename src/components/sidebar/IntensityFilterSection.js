import React from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import ControlSection from "./ControlSection";
import ControlButton from "./ControlButton";

function IntensityFilterSection({
  intensityFilter,
  setIntensityFilter,
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
        <ControlButton
          onClick={() => setIntensityFilter("all")}
          isActive={intensityFilter === "all"}
        >
          All Intensities
        </ControlButton>
        <ControlButton
          onClick={() => setIntensityFilter("low")}
          isActive={intensityFilter === "low"}
        >
          Low Intensity
        </ControlButton>
        <ControlButton
          onClick={() => setIntensityFilter("medium")}
          isActive={intensityFilter === "medium"}
        >
          Medium Intensity
        </ControlButton>
        <ControlButton
          onClick={() => setIntensityFilter("high")}
          isActive={intensityFilter === "high"}
        >
          High Intensity
        </ControlButton>
      </div>
    </ControlSection>
  );
}

export default IntensityFilterSection;
