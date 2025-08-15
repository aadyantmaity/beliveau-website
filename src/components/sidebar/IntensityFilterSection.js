import React from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import ControlSection from "./ControlSection";
import CustomDropdown from "./CustomDropdown";

function IntensityFilterSection({
  intensityFilter,
  setIntensityFilter,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
}) {
  const intensityOptions = [
    { value: "all", label: "All Intensities" },
    { value: "low", label: "Low (0-33%)" },
    { value: "medium", label: "Medium (33-66%)" },
    { value: "high", label: "High (66-100%)" },
  ];

  const handleIntensityChange = (value) => {
    setIntensityFilter(value);
  };

  return (
    <ControlSection
      title="Intensity Range"
      icon={MagnifyingGlass}
      tooltip="Filter data points based on their intensity values. Low shows the bottom 33%, Medium shows the middle 33%, and High shows the top 33% of intensity values from the selected channel."
      sidebarCollapsed={sidebarCollapsed}
      showTooltip={showTooltip}
      hideTooltip={hideTooltip}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <CustomDropdown
          value={intensityFilter}
          onChange={handleIntensityChange}
          options={intensityOptions}
          placeholder="Select intensity range"
        />
      </div>
    </ControlSection>
  );
}

export default IntensityFilterSection;
