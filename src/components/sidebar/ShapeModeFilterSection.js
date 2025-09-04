import React from "react";
import ControlSection from "./ControlSection";
import ControlButton from "./ControlButton";
import CustomDropdown from "./CustomDropdown";

const ShapeModeFilterSection = ({
  selectedPCs,
  setSelectedPCs,
  selectedPCmpIds,
  setSelectedPCmpIds,
  pcPercentiles,
  setPcPercentiles,
  pcmpIdPercentiles,
  setPcmpIdPercentiles,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
}) => {
  const pcTypes = [
    {
      id: "default",
      name: "Default (No Filter)",
      description: "No PC filtering applied",
    },
    {
      id: "PC1",
      name: "PC1",
      description: "First principal component",
    },
    {
      id: "PC2",
      name: "PC2",
      description: "Second principal component",
    },
    {
      id: "PC3",
      name: "PC3",
      description: "Third principal component",
    },
    {
      id: "PC4",
      name: "PC4",
      description: "Fourth principal component",
    },
    {
      id: "PC5",
      name: "PC5",
      description: "Fifth principal component",
    },
    {
      id: "PC6",
      name: "PC6",
      description: "Sixth principal component",
    },
    {
      id: "PC7",
      name: "PC7",
      description: "Seventh principal component",
    },
    {
      id: "PC8",
      name: "PC8",
      description: "Eighth principal component",
    },
  ];

  const pcmpIdTypes = [
    {
      id: "default",
      name: "Default (No Filter)",
      description: "No PC mpId filtering applied",
    },
    {
      id: "PC1_mpId",
      name: "PC1 mpId",
      description: "First principal component mpId",
    },
    {
      id: "PC2_mpId",
      name: "PC2 mpId",
      description: "Second principal component mpId",
    },
    {
      id: "PC3_mpId",
      name: "PC3 mpId",
      description: "Third principal component mpId",
    },
    {
      id: "PC4_mpId",
      name: "PC4 mpId",
      description: "Fourth principal component mpId",
    },
    {
      id: "PC5_mpId",
      name: "PC5 mpId",
      description: "Fifth principal component mpId",
    },
    {
      id: "PC6_mpId",
      name: "PC6 mpId",
      description: "Sixth principal component mpId",
    },
    {
      id: "PC7_mpId",
      name: "PC7 mpId",
      description: "Seventh principal component mpId",
    },
    {
      id: "PC8_mpId",
      name: "PC8 mpId",
      description: "Eighth principal component mpId",
    },
  ];

  const percentileOptions = [
    { value: "all", label: "All Data" },
    { value: "low", label: "Low (0-33%)" },
    { value: "medium", label: "Medium (33-66%)" },
    { value: "high", label: "High (66-100%)" },
  ];

  const handlePCToggle = (pcId) => {
    setSelectedPCs((prev) => {
      if (pcId === "default") {
        return [];
      } else if (prev.includes(pcId)) {
        return prev.filter((id) => id !== pcId);
      } else {
        return [...prev.filter((id) => id !== "default"), pcId];
      }
    });
  };

  const handlePCmpIdToggle = (pcmpIdId) => {
    setSelectedPCmpIds((prev) => {
      if (pcmpIdId === "default") {
        return [];
      } else if (prev.includes(pcmpIdId)) {
        return prev.filter((id) => id !== pcmpIdId);
      } else {
        return [...prev.filter((id) => id !== "default"), pcmpIdId];
      }
    });
  };

  const handlePcPercentileChange = (pcId, percentile) => {
    setPcPercentiles((prev) => ({
      ...prev,
      [pcId]: percentile,
    }));
  };

  const handlePcmpIdPercentileChange = (pcmpIdId, percentile) => {
    setPcmpIdPercentiles((prev) => ({
      ...prev,
      [pcmpIdId]: percentile,
    }));
  };

  return (
    <>
      <ControlSection
        title="PC Columns"
        tooltip="Filter data points based on their principal component values. Select PC columns to enable filtering by ranges."
        sidebarCollapsed={sidebarCollapsed}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {pcTypes.map((pc) => (
            <ControlButton
              key={pc.id}
              onClick={() => handlePCToggle(pc.id)}
              isActive={
                pc.id === "default"
                  ? selectedPCs.length === 0
                  : selectedPCs.includes(pc.id)
              }
            >
              {pc.name}
            </ControlButton>
          ))}
        </div>
      </ControlSection>

      {/* PC Range Section */}
      {selectedPCs.length > 0 && (
        <ControlSection
          title="PC Range"
          tooltip="Set percentile ranges for selected PC columns. Low shows the bottom 33%, Medium shows the middle 33%, and High shows the top 33% of PC values."
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
            {selectedPCs.map((pcId) => {
              const pc = pcTypes.find((p) => p.id === pcId);
              return (
                <div key={pcId} style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    {pc.name}:
                  </div>
                  <CustomDropdown
                    value={pcPercentiles[pcId] || "all"}
                    onChange={(value) => handlePcPercentileChange(pcId, value)}
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
        title="PC mpId Columns"
        tooltip="Filter data points based on their principal component mpId values. Select PC mpId columns to enable filtering by ranges."
        sidebarCollapsed={sidebarCollapsed}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {pcmpIdTypes.map((pcmpId) => (
            <ControlButton
              key={pcmpId.id}
              onClick={() => handlePCmpIdToggle(pcmpId.id)}
              isActive={
                pcmpId.id === "default"
                  ? selectedPCmpIds.length === 0
                  : selectedPCmpIds.includes(pcmpId.id)
              }
            >
              {pcmpId.name}
            </ControlButton>
          ))}
        </div>
      </ControlSection>

      {/* PC mpId Range Section */}
      {selectedPCmpIds.length > 0 && (
        <ControlSection
          title="PC mpId Range"
          tooltip="Set percentile ranges for selected PC mpId columns. Low shows the bottom 33%, Medium shows the middle 33%, and High shows the top 33% of PC mpId values."
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
            {selectedPCmpIds.map((pcmpIdId) => {
              const pcmpId = pcmpIdTypes.find((p) => p.id === pcmpIdId);
              return (
                <div key={pcmpIdId} style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    {pcmpId.name}:
                  </div>
                  <CustomDropdown
                    value={pcmpIdPercentiles[pcmpIdId] || "all"}
                    onChange={(value) =>
                      handlePcmpIdPercentileChange(pcmpIdId, value)
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

export default ShapeModeFilterSection;
