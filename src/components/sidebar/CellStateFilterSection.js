import React from "react";
import ControlSection from "./ControlSection";
import ControlButton from "./ControlButton";

const CellStateFilterSection = ({
  selectedCellStates,
  setSelectedCellStates,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
}) => {
  const cellStateTypes = [
    {
      id: "all",
      name: "All States",
      description: "Show all cell states",
    },
    {
      id: "FUCCI-Green+",
      name: "FUCCI Green+",
      description: "Cells in G1 phase",
    },
    {
      id: "FUCCI-Red+",
      name: "FUCCI Red+",
      description: "Cells in S/G2/M phase",
    },
    {
      id: "FUCCI-Negative",
      name: "FUCCI Negative",
      description: "Cells not expressing FUCCI markers",
    },
    {
      id: "FUCCI-Double+",
      name: "FUCCI Double",
      description: "Cells expressing both FUCCI-Green+ and FUCCI-Red+",
    }
  ];

  const handleCellStateSelect = (stateId) => {
    if (stateId === "all") {
      // If "all" is clicked, clear all selections (show all)
      setSelectedCellStates([]);
    } else {
      // Single select: only select the clicked state
      setSelectedCellStates([stateId]);
    }
  };

  return (
    <ControlSection
      title="Cell State"
      tooltip="Filter data points based on their FUCCI cell cycle state. FUCCI-Green+ represents G1 phase, FUCCI-Red+ represents S/G2/M phase, FUCCI-Negative represents cells not expressing FUCCI markers, and FUCCI-Double+ represents cells expressing both FUCCI-Green+ and FUCCI-Red+."
      sidebarCollapsed={sidebarCollapsed}
      showTooltip={showTooltip}
      hideTooltip={hideTooltip}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {cellStateTypes.map((state) => (
          <ControlButton
            key={state.id}
            onClick={() => handleCellStateSelect(state.id)}
            isActive={
              state.id === "all"
                ? selectedCellStates.length === 0
                : selectedCellStates.includes(state.id)
            }
          >
            {state.name}
          </ControlButton>
        ))}
      </div>
    </ControlSection>
  );
};

export default CellStateFilterSection;
