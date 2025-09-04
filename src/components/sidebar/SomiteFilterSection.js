import React from "react";
import ControlSection from "./ControlSection";
import ControlButton from "./ControlButton";
import CustomDropdown from "./CustomDropdown";

const SomiteFilterSection = ({
  selectedSomiteStages,
  setSelectedSomiteStages,
  selectedSomiteIds,
  setSelectedSomiteIds,
  somiteStagePercentiles,
  setSomiteStagePercentiles,
  somiteIdPercentiles,
  setSomiteIdPercentiles,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
}) => {
  const somiteStageTypes = [
    {
      id: "default",
      name: "Default (No Filter)",
      description: "No somite stage filtering applied",
    },
    {
      id: "somite_stage",
      name: "Somite Stage",
      description: "Developmental stage of the somite",
    },
  ];

  const somiteIdTypes = [
    {
      id: "default",
      name: "Default (No Filter)",
      description: "No somite ID filtering applied",
    },
    {
      id: "Somite_ID",
      name: "Somite ID",
      description: "Unique identifier for the somite",
    },
  ];

  const percentileOptions = [
    { value: "all", label: "All Data" },
    { value: "low", label: "Low (0-33%)" },
    { value: "medium", label: "Medium (33-66%)" },
    { value: "high", label: "High (66-100%)" },
  ];

  const handleSomiteStageToggle = (stageId) => {
    setSelectedSomiteStages((prev) => {
      if (stageId === "default") {
        return [];
      } else if (prev.includes(stageId)) {
        return prev.filter((id) => id !== stageId);
      } else {
        return [...prev.filter((id) => id !== "default"), stageId];
      }
    });
  };

  const handleSomiteIdToggle = (idId) => {
    setSelectedSomiteIds((prev) => {
      if (idId === "default") {
        return [];
      } else if (prev.includes(idId)) {
        return prev.filter((id) => id !== idId);
      } else {
        return [...prev.filter((id) => id !== "default"), idId];
      }
    });
  };

  const handleSomiteStagePercentileChange = (stageId, percentile) => {
    setSomiteStagePercentiles((prev) => ({
      ...prev,
      [stageId]: percentile,
    }));
  };

  const handleSomiteIdPercentileChange = (idId, percentile) => {
    setSomiteIdPercentiles((prev) => ({
      ...prev,
      [idId]: percentile,
    }));
  };

  return (
    <>
      <ControlSection
        title="Somite Stage"
        tooltip="Filter data points based on their somite developmental stage. Select somite stage to enable filtering by ranges."
        sidebarCollapsed={sidebarCollapsed}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {somiteStageTypes.map((stage) => (
            <ControlButton
              key={stage.id}
              onClick={() => handleSomiteStageToggle(stage.id)}
              isActive={
                stage.id === "default"
                  ? selectedSomiteStages.length === 0
                  : selectedSomiteStages.includes(stage.id)
              }
            >
              {stage.name}
            </ControlButton>
          ))}
        </div>
      </ControlSection>

      {/* Somite Stage Range Section */}
      {selectedSomiteStages.length > 0 && (
        <ControlSection
          title="Somite Stage Range"
          tooltip="Set percentile ranges for selected somite stage. Low shows the bottom 33%, Medium shows the middle 33%, and High shows the top 33% of stage values."
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
            {selectedSomiteStages.map((stageId) => {
              const stage = somiteStageTypes.find((s) => s.id === stageId);
              return (
                <div key={stageId} style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    {stage.name}:
                  </div>
                  <CustomDropdown
                    value={somiteStagePercentiles[stageId] || "all"}
                    onChange={(value) =>
                      handleSomiteStagePercentileChange(stageId, value)
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

      <ControlSection
        title="Somite ID"
        tooltip="Filter data points based on their somite ID. Select somite ID to enable filtering by ranges."
        sidebarCollapsed={sidebarCollapsed}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {somiteIdTypes.map((id) => (
            <ControlButton
              key={id.id}
              onClick={() => handleSomiteIdToggle(id.id)}
              isActive={
                id.id === "default"
                  ? selectedSomiteIds.length === 0
                  : selectedSomiteIds.includes(id.id)
              }
            >
              {id.name}
            </ControlButton>
          ))}
        </div>
      </ControlSection>

      {/* Somite ID Range Section */}
      {selectedSomiteIds.length > 0 && (
        <ControlSection
          title="Somite ID Range"
          tooltip="Set percentile ranges for selected somite ID. Low shows the bottom 33%, Medium shows the middle 33%, and High shows the top 33% of ID values."
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
            {selectedSomiteIds.map((idId) => {
              const id = somiteIdTypes.find((i) => i.id === idId);
              return (
                <div key={idId} style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    {id.name}:
                  </div>
                  <CustomDropdown
                    value={somiteIdPercentiles[idId] || "all"}
                    onChange={(value) =>
                      handleSomiteIdPercentileChange(idId, value)
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

export default SomiteFilterSection;
