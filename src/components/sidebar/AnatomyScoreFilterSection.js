import React from "react";
import ControlSection from "./ControlSection";
import ControlButton from "./ControlButton";
import CustomDropdown from "./CustomDropdown";

const AnatomyScoreFilterSection = ({
  selectedAnatomyScores,
  setSelectedAnatomyScores,
  anatomyScorePercentiles,
  setAnatomyScorePercentiles,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
}) => {
  const anatomyScoreTypes = [
    {
      id: "default",
      name: "Default (No Filter)",
      description: "No anatomy score filtering applied",
    },
    {
      id: "Anterior_Posterior",
      name: "Anterior-Posterior",
      description: "Position along the anterior-posterior axis",
    },
    {
      id: "Dorsal_Ventral_Score",
      name: "Dorsal-Ventral",
      description: "Position along the dorsal-ventral axis",
    },
    {
      id: "Left_Right_Score",
      name: "Left-Right",
      description: "Position along the left-right axis",
    },
  ];

  const percentileOptions = [
    { value: "all", label: "All Data" },
    { value: "low", label: "Low (0-33%)" },
    { value: "medium", label: "Medium (33-66%)" },
    { value: "high", label: "High (66-100%)" },
  ];

  const handleAnatomyScoreToggle = (scoreId) => {
    setSelectedAnatomyScores((prev) => {
      if (scoreId === "default") {
        // If default is clicked, clear all selections (no filter)
        return [];
      } else if (prev.includes(scoreId)) {
        // If a specific score is deselected, remove it
        return prev.filter((id) => id !== scoreId);
      } else {
        // If a specific score is selected, add it and remove default if present
        return [...prev.filter((id) => id !== "default"), scoreId];
      }
    });
  };

  const handlePercentileChange = (scoreId, percentile) => {
    setAnatomyScorePercentiles((prev) => ({
      ...prev,
      [scoreId]: percentile,
    }));
  };

  return (
    <>
      <ControlSection
        title="Anatomy Score"
        tooltip="Filter data points based on their anatomical position scores. Select anatomy score types to enable filtering by ranges."
        sidebarCollapsed={sidebarCollapsed}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {anatomyScoreTypes.map((score) => (
            <ControlButton
              key={score.id}
              onClick={() => handleAnatomyScoreToggle(score.id)}
              isActive={
                score.id === "default"
                  ? selectedAnatomyScores.length === 0
                  : selectedAnatomyScores.includes(score.id)
              }
            >
              {score.name}
            </ControlButton>
          ))}
        </div>
      </ControlSection>

      {/* Anatomy Score Range Section */}
      {selectedAnatomyScores.length > 0 && (
        <ControlSection
          title="Anatomy Score Range"
          tooltip="Set percentile ranges for selected anatomy score types. Low shows the bottom 33%, Medium shows the middle 33%, and High shows the top 33% of score values."
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
            {selectedAnatomyScores.map((scoreId) => {
              const score = anatomyScoreTypes.find((s) => s.id === scoreId);
              return (
                <div key={scoreId} style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    {score.name}:
                  </div>
                  <CustomDropdown
                    value={anatomyScorePercentiles[scoreId] || "all"}
                    onChange={(value) => handlePercentileChange(scoreId, value)}
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

export default AnatomyScoreFilterSection;
