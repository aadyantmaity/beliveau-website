import React, { useState, useEffect } from "react";
import ControlSection from "./ControlSection";

// PC filter ranges as provided - moved outside component since it's constant
const pcRanges = {
  PC1: { min: -3.639, max: 7.731 },
  PC2: { min: -5.393, max: 3.691 },
  PC3: { min: -4.084, max: 4.778 },
  PC4: { min: -3.846, max: 4.778 },
  PC5: { min: -3.658, max: 3.889 },
  PC6: { min: -4.151, max: 3.587 },
  PC7: { min: -1.792, max: 1.903 },
  PC8: { min: -1.936, max: 1.701 },
};

const PCFilterSection = ({
  pcFilters,
  setPCFilters,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
}) => {
  // Local state for input values
  const [inputValues, setInputValues] = useState({});

  // Initialize input values with current filter values
  useEffect(() => {
    const newInputValues = {};
    Object.keys(pcRanges).forEach((pc) => {
      const currentFilter = pcFilters[pc];
      if (currentFilter) {
        newInputValues[pc] = {
          min: currentFilter.min.toString(),
          max: currentFilter.max.toString(),
        };
      } else {
        newInputValues[pc] = {
          min: pcRanges[pc].min.toString(),
          max: pcRanges[pc].max.toString(),
        };
      }
    });
    setInputValues(newInputValues);
  }, [pcFilters]);

  const handleInputChange = (pc, field, value) => {
    setInputValues((prev) => ({
      ...prev,
      [pc]: {
        ...prev[pc],
        [field]: value,
      },
    }));
  };

  const handleSaveFilter = (pc) => {
    const input = inputValues[pc];
    if (!input) {
      return;
    }

    // Get current filter values as fallback
    const currentFilter = getCurrentFilter(pc);

    // Use input values if provided and not empty, otherwise use current filter values
    const minInput =
      input.min !== "" ? input.min : currentFilter.min.toString();
    const maxInput =
      input.max !== "" ? input.max : currentFilter.max.toString();

    const minValue = parseFloat(minInput);
    const maxValue = parseFloat(maxInput);

    if (isNaN(minValue) || isNaN(maxValue)) {
      return;
    }

    const range = pcRanges[pc];
    const clampedMin = Math.max(range.min, Math.min(range.max, minValue));
    const clampedMax = Math.max(range.min, Math.min(range.max, maxValue));

    const newFilter = {
      min: Math.min(clampedMin, clampedMax),
      max: Math.max(clampedMin, clampedMax),
    };

    setPCFilters((prev) => {
      const updated = {
        ...prev,
        [pc]: newFilter,
      };
      return updated;
    });
  };

  // Reset just one PC
  const resetPCFilter = (pc) => {
    const range = pcRanges[pc];
    const resetFilter = { min: range.min, max: range.max };
    const resetInput = { min: range.min.toString(), max: range.max.toString() };

    // Batch updates in a single setState call
    setPCFilters((prev) => ({ ...prev, [pc]: resetFilter }));
    setInputValues((prev) => ({ ...prev, [pc]: resetInput }));
  };

  // Reset all PCs at once
  const resetAllPCFilters = () => {
    // Clear all PC filters instead of setting to default ranges
    setPCFilters({});

    // Reset input values to default ranges for display
    const resetInputs = {};
    for (const [pc, range] of Object.entries(pcRanges)) {
      resetInputs[pc] = {
        min: range.min.toString(),
        max: range.max.toString(),
      };
    }
    setInputValues(resetInputs);
  };

  const getCurrentFilter = (pc) => {
    return pcFilters[pc] || { min: pcRanges[pc].min, max: pcRanges[pc].max };
  };

  const getInputValue = (pc, field) => {
    const current = inputValues[pc];
    if (current && current[field] !== undefined) {
      return current[field];
    }
    return getCurrentFilter(pc)[field].toString();
  };

  return (
    <ControlSection
      title="PC Filters"
      tooltip="Filter cells based on Principal Component values. Enter min/max values and click Save to apply filters. Cells within the selected ranges will be colored normally, while cells outside the ranges will appear gray."
      sidebarCollapsed={sidebarCollapsed}
      showTooltip={showTooltip}
      hideTooltip={hideTooltip}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Reset All Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "12px", color: "#888" }}>
            Reset all filters
          </span>
          <button
            onClick={resetAllPCFilters}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
            }}
          >
            Reset All
          </button>
        </div>

        {/* PC Filter Inputs */}
        {Object.keys(pcRanges).map((pc) => {
          const range = pcRanges[pc];
          const currentFilter = getCurrentFilter(pc);

          return (
            <div
              key={pc}
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {/* PC Label and Reset Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ fontSize: "12px", fontWeight: "500", color: "#fff" }}
                >
                  {pc}
                </span>
                <button
                  onClick={() => resetPCFilter(pc)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#888",
                    fontSize: "10px",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: "2px 4px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "#888";
                  }}
                >
                  Reset
                </button>
              </div>

              {/* Current Filter Values Display */}
              <div
                style={{
                  fontSize: "10px",
                  color: "#aaa",
                  textAlign: "center",
                  padding: "4px 8px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "4px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                Current: {currentFilter.min.toFixed(3)} to{" "}
                {currentFilter.max.toFixed(3)}
              </div>

              {/* Input Fields */}
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                {/* Min Input */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    flex: 1,
                  }}
                >
                  <label style={{ fontSize: "10px", color: "#ccc" }}>
                    Min Value
                  </label>
                  <input
                    type="number"
                    min={range.min}
                    max={range.max}
                    step="0.001"
                    value={getInputValue(pc, "min")}
                    onChange={(e) =>
                      handleInputChange(pc, "min", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "4px",
                      color: "white",
                      fontSize: "12px",
                      outline: "none",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.5)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                    }}
                    placeholder={range.min.toFixed(3)}
                  />
                </div>

                {/* Max Input */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    flex: 1,
                  }}
                >
                  <label style={{ fontSize: "10px", color: "#ccc" }}>
                    Max Value
                  </label>
                  <input
                    type="number"
                    min={range.min}
                    max={range.max}
                    step="0.001"
                    value={getInputValue(pc, "max")}
                    onChange={(e) =>
                      handleInputChange(pc, "max", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "4px",
                      color: "white",
                      fontSize: "12px",
                      outline: "none",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.5)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                    }}
                    placeholder={range.max.toFixed(3)}
                  />
                </div>

                {/* Save Button */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label style={{ fontSize: "10px", color: "transparent" }}>
                    Save
                  </label>
                  <button
                    onClick={() => handleSaveFilter(pc)}
                    style={{
                      background: "rgba(0, 150, 255, 0.2)",
                      border: "1px solid rgba(0, 150, 255, 0.4)",
                      color: "#4fc3f7",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(0, 150, 255, 0.3)";
                      e.target.style.borderColor = "rgba(0, 150, 255, 0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(0, 150, 255, 0.2)";
                      e.target.style.borderColor = "rgba(0, 150, 255, 0.4)";
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Range Indicator */}
              <div
                style={{
                  fontSize: "9px",
                  color: "#666",
                  textAlign: "center",
                  padding: "2px 0",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  marginTop: "4px",
                }}
              >
                Range: {range.min.toFixed(3)} to {range.max.toFixed(3)}
              </div>
            </div>
          );
        })}
      </div>
    </ControlSection>
  );
};

export default PCFilterSection;
