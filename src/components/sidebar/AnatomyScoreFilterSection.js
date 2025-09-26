import React from "react";
import ControlSection from "./ControlSection";
import CustomDropdown from "./CustomDropdown";

const AnatomyScoreFilterSection = ({
  selectedAnatomyScores,
  setSelectedAnatomyScores,
  anatomyScorePercentiles,
  setAnatomyScorePercentiles,
  anatomyHighlightMode,
  setAnatomyHighlightMode,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
  disabled = false,
}) => {

  const highlightOptions = [
    { value: "none", label: "Default (No Filter)" },
    { value: "anterior_posterior", label: "Anterior-Posterior" },
    { value: "dorsal_ventral", label: "Dorsal-Ventral" },
    { value: "left_right", label: "Left-Right" },
  ];


  return (
    <>
      <ControlSection
        title="Anatomy"
        tooltip="Highlight specific anatomical regions based on median splits. Select a region to highlight, others will be shown in gray."
        sidebarCollapsed={sidebarCollapsed}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        disabled={disabled}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <CustomDropdown
            value={anatomyHighlightMode || "none"}
            onChange={(value) => setAnatomyHighlightMode(value)}
            options={highlightOptions}
            placeholder="Select region to highlight"
          />
        </div>
      </ControlSection>
    </>
  );
};

export default AnatomyScoreFilterSection;
