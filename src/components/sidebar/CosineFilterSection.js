import React from "react";
import { ArrowsOutCardinal } from "@phosphor-icons/react";
import ControlSection from "./ControlSection";
import ControlButton from "./ControlButton";
import CustomDropdown from "./CustomDropdown";

const CosineFilterSection = ({
  selectedCosines,
  setSelectedCosines,
  cosinePercentiles,
  setCosinePercentiles,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
}) => {
  const cosineTypes = [
    {
      id: "default",
      name: "Default (No Filter)",
      description: "No cosine filtering applied",
    },
    {
      id: "major",
      name: "Major Cosine (Abs)",
      description: "Absolute cosine of major axis orientation",
    },
    {
      id: "intermediate",
      name: "Intermediate Cosine (Abs)",
      description: "Absolute cosine of intermediate axis orientation",
    },
    {
      id: "minor",
      name: "Minor Cosine (Abs)",
      description: "Absolute cosine of minor axis orientation",
    },
  ];

  const percentileOptions = [
    { value: "all", label: "All Data" },
    { value: "low", label: "Low (0-33%)" },
    { value: "medium", label: "Medium (33-66%)" },
    { value: "high", label: "High (66-100%)" },
  ];

  const handleCosineToggle = (cosineId) => {
    setSelectedCosines((prev) => {
      if (cosineId === "default") {
        // If default is clicked, clear all selections (no filter)
        return [];
      } else if (prev.includes(cosineId)) {
        // If a specific cosine is deselected, remove it
        return prev.filter((id) => id !== cosineId);
      } else {
        // If a specific cosine is selected, add it and remove default if present
        return [...prev.filter((id) => id !== "default"), cosineId];
      }
    });
  };

  const handlePercentileChange = (cosineId, percentile) => {
    setCosinePercentiles((prev) => ({
      ...prev,
      [cosineId]: percentile,
    }));
  };

  return (
    <>
      <ControlSection
        title="Cosine Type"
        icon={ArrowsOutCardinal}
        tooltip="Filter data points based on their orientation cosine values. Select cosine types to enable filtering by ranges."
        sidebarCollapsed={sidebarCollapsed}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {cosineTypes.map((cosine) => (
            <ControlButton
              key={cosine.id}
              onClick={() => handleCosineToggle(cosine.id)}
              isActive={
                cosine.id === "default"
                  ? selectedCosines.length === 0
                  : selectedCosines.includes(cosine.id)
              }
            >
              {cosine.name}
            </ControlButton>
          ))}
        </div>
      </ControlSection>

      {/* Cosine Range Section */}
      {selectedCosines.length > 0 && (
        <ControlSection
          title="Cosine Range"
          icon={ArrowsOutCardinal}
          tooltip="Set percentile ranges for selected cosine types. Low shows the bottom 33%, Medium shows the middle 33%, and High shows the top 33% of cosine values."
          sidebarCollapsed={sidebarCollapsed}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginLeft: "16px",
            }}
          >
            {selectedCosines.map((cosineId) => {
              const cosine = cosineTypes.find((c) => c.id === cosineId);
              return (
                <div key={cosineId} style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    {cosine.name}:
                  </div>
                  <CustomDropdown
                    value={cosinePercentiles[cosineId] || "all"}
                    onChange={(value) =>
                      handlePercentileChange(cosineId, value)
                    }
                    options={percentileOptions}
                    placeholder="Select percentile range"
                  />
                </div>
              );
            })}
          </div>
        </ControlSection>
      )}
    </>
  );
};

export default CosineFilterSection;
