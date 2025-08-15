import React from "react";
import { Ruler } from "@phosphor-icons/react";
import ControlSection from "./ControlSection";
import ControlButton from "./ControlButton";
import CustomDropdown from "./CustomDropdown";

const MagnitudeFilterSection = ({
  selectedMagnitudes,
  setSelectedMagnitudes,
  magnitudePercentiles,
  setMagnitudePercentiles,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
}) => {
  const magnitudeTypes = [
    {
      id: "default",
      name: "Default (No Filter)",
      description: "No magnitude filtering applied",
    },
    {
      id: "major",
      name: "Major Magnitude",
      description: "Length of the major axis",
    },
    {
      id: "intermediate",
      name: "Intermediate Magnitude",
      description: "Length of the intermediate axis",
    },
    {
      id: "minor",
      name: "Minor Magnitude",
      description: "Length of the minor axis",
    },
  ];

  const percentileOptions = [
    { value: "all", label: "All Data" },
    { value: "low", label: "Low (0-33%)" },
    { value: "medium", label: "Medium (33-66%)" },
    { value: "high", label: "High (66-100%)" },
  ];

  const handleMagnitudeToggle = (magnitudeId) => {
    setSelectedMagnitudes((prev) => {
      if (magnitudeId === "default") {
        // If default is clicked, clear all selections (no filter)
        return [];
      } else if (prev.includes(magnitudeId)) {
        // If a specific magnitude is deselected, remove it
        return prev.filter((id) => id !== magnitudeId);
      } else {
        // If a specific magnitude is selected, add it and remove default if present
        return [...prev.filter((id) => id !== "default"), magnitudeId];
      }
    });
  };

  const handlePercentileChange = (magnitudeId, percentile) => {
    setMagnitudePercentiles((prev) => ({
      ...prev,
      [magnitudeId]: percentile,
    }));
  };

  return (
    <>
      <ControlSection
        title="Magnitude Type"
        icon={Ruler}
        tooltip="Filter data points based on their shape magnitude values. Select magnitude types to enable filtering by ranges."
        sidebarCollapsed={sidebarCollapsed}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {magnitudeTypes.map((magnitude) => (
            <ControlButton
              key={magnitude.id}
              onClick={() => handleMagnitudeToggle(magnitude.id)}
              isActive={
                magnitude.id === "default"
                  ? selectedMagnitudes.length === 0
                  : selectedMagnitudes.includes(magnitude.id)
              }
            >
              {magnitude.name}
            </ControlButton>
          ))}
        </div>
      </ControlSection>

      {/* Magnitude Range Section */}
      {selectedMagnitudes.length > 0 && (
        <ControlSection
          title="Magnitude Range"
          icon={Ruler}
          tooltip="Set percentile ranges for selected magnitude types. Low shows the bottom 33%, Medium shows the middle 33%, and High shows the top 33% of magnitude values."
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
            {selectedMagnitudes.map((magnitudeId) => {
              const magnitude = magnitudeTypes.find(
                (m) => m.id === magnitudeId
              );
              return (
                <div key={magnitudeId} style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    {magnitude.name}:
                  </div>
                  <CustomDropdown
                    value={magnitudePercentiles[magnitudeId] || "all"}
                    onChange={(value) =>
                      handlePercentileChange(magnitudeId, value)
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

export default MagnitudeFilterSection;
