import React from "react";
import ControlSection from "./ControlSection";

const SomiteIdFilterSection = ({
  selectedSomiteIds,
  setSelectedSomiteIds,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
}) => {
  // Generate somite ID options (1-42, excluding 0 and 22 which are missing)
  const somiteIdOptions = [];
  for (let i = 1; i <= 42; i++) {
    if (i !== 22) { // Skip 22 as it's missing from the data
      somiteIdOptions.push({
        id: i,
        name: `Somite ${i}`,
        description: `Show cells from somite ${i}`,
      });
    }
  }

  const handleSomiteIdToggle = (somiteId) => {
    setSelectedSomiteIds((prev) => {
      if (prev.includes(somiteId)) {
        return prev.filter((id) => id !== somiteId);
      } else {
        return [...prev, somiteId];
      }
    });
  };

  const handleSelectAll = () => {
    const allSomiteIds = somiteIdOptions.map(option => option.id);
    setSelectedSomiteIds(allSomiteIds);
  };

  const handleDeselectAll = () => {
    setSelectedSomiteIds([]);
  };

  const allSelected = selectedSomiteIds.length === somiteIdOptions.length;


  return (
    <ControlSection
      title="Somite ID"
      tooltip="Highlight data points based on their somite ID. Select specific somite IDs to color cells from those somites while keeping others gray."
      sidebarCollapsed={sidebarCollapsed}
      showTooltip={showTooltip}
      hideTooltip={hideTooltip}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* All checkbox */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
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

        {/* Somite ID buttons */}
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
          {somiteIdOptions.map((option) => {
            const isSelected = selectedSomiteIds.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleSomiteIdToggle(option.id)}
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

        {/* Selection summary */}
        {selectedSomiteIds.length > 0 && (
          <div
            style={{
              fontSize: "12px",
              color: "#ccc",
              padding: "8px 12px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              textAlign: "center",
            }}
          >
            {selectedSomiteIds.length} somite{selectedSomiteIds.length !== 1 ? "s" : ""} selected
          </div>
        )}
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

export default SomiteIdFilterSection;
