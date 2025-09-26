import React from "react";
import ControlSection from "./ControlSection";

const SomiteStageFilterSection = ({
  selectedSomiteStages,
  setSelectedSomiteStages,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
  disabled = false,
}) => {
  // Generate somite stage options (1-21, contiguous values)
  const somiteStageOptions = [];
  for (let i = 1; i <= 21; i++) {
    somiteStageOptions.push({
      id: i,
      name: `Stage ${i}`,
      description: `Show cells from somite stage ${i}`,
    });
  }

  const handleSomiteStageToggle = (somiteStage) => {
    setSelectedSomiteStages((prev) => {
      if (prev.includes(somiteStage)) {
        return prev.filter((stage) => stage !== somiteStage);
      } else {
        return [...prev, somiteStage];
      }
    });
  };

  const handleSelectAll = () => {
    const allSomiteStages = somiteStageOptions.map((option) => option.id);
    setSelectedSomiteStages(allSomiteStages);
  };

  const handleDeselectAll = () => {
    setSelectedSomiteStages([]);
  };

  const allSelected = selectedSomiteStages.length === somiteStageOptions.length;

  return (
    <ControlSection
      title="Somite Stage"
      tooltip="Highlight data points based on their somite stage. Select specific somite stages to color cells from those stages while keeping others gray."
      sidebarCollapsed={sidebarCollapsed}
      showTooltip={showTooltip}
      hideTooltip={hideTooltip}
      disabled={disabled}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Select All checkbox */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontSize: "12px",
              color: "#ccc",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={allSelected}
              onChange={allSelected ? handleDeselectAll : handleSelectAll}
              style={{
                width: "16px",
                height: "16px",
                accentColor: "#4CAF50",
                cursor: "pointer",
              }}
            />
            <span style={{ fontWeight: "500" }}>
              {allSelected ? "Deselect All" : "Select All"}
            </span>
          </label>
        </div>


        {/* Somite Stage buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "6px",
            maxHeight: "240px",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
            padding: "4px",
          }}
          className="somite-scroll"
        >
          {somiteStageOptions.map((option) => {
            const isSelected = selectedSomiteStages.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleSomiteStageToggle(option.id)}
                style={{
                  padding: "8px 4px",
                  background: isSelected
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                  color: isSelected ? "white" : "#999",
                  border: isSelected
                    ? "1px solid rgba(255, 255, 255, 0.3)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: isSelected ? "600" : "400",
                  transition: "all 0.15s ease",
                  minHeight: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.target.style.background = "rgba(255, 255, 255, 0.1)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                    e.target.style.color = "#ccc";
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.style.background = "rgba(255, 255, 255, 0.05)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.target.style.color = "#999";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                {option.id}
              </button>
            );
          })}
        </div>


        {/* Clear Filter Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "8px",
          }}
        >
          <button
            onClick={handleDeselectAll}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
          >
            Clear Filter
          </button>
        </div>
      </div>

      <style>{`
        .somite-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .somite-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .somite-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        .somite-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </ControlSection>
  );
};

export default SomiteStageFilterSection;
