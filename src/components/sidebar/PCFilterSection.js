import React, { useState, useEffect } from "react";
import ControlSection from "./ControlSection";

// PC mpId filter options - using 1-9 values for sliders
const pcMpIdOptions = {
  PC1_mpId: { name: "Volume" },
  PC2_mpId: { name: "Height" },
  PC3_mpId: { name: "Axis tilt" },
  PC4_mpId: { name: "'Boomerang'" },
  PC5_mpId: { name: "'Pear'" },
  PC6_mpId: { name: "'Wedge'" },
};

const PCFilterSection = ({
  pcFilters,
  setPCFilters,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
  disabled = false,
}) => {
  // Local state for slider values (1-9)
  const [sliderValues, setSliderValues] = useState({});

  // Initialize slider values
  useEffect(() => {
    const newSliderValues = {};
    Object.keys(pcMpIdOptions).forEach((pc) => {
      const currentFilter = pcFilters[pc];
      if (currentFilter && currentFilter.value !== undefined) {
        newSliderValues[pc] = currentFilter.value;
      } else {
        newSliderValues[pc] = 1; // Default to 1
      }
    });
    setSliderValues(newSliderValues);
  }, [pcFilters]);

  const handleSliderChange = (pc, value) => {
    const newValue = parseInt(value);
    setSliderValues((prev) => ({
      ...prev,
      [pc]: newValue,
    }));

    // Update the filter - only one PC can be active at a time
    setPCFilters((prev) => {
      const newFilters = {};
      // Clear all other PC filters
      Object.keys(pcMpIdOptions).forEach((key) => {
        if (key !== pc) {
          newFilters[key] = { value: 1, active: false };
        }
      });
      // Set the current PC filter
      newFilters[pc] = { value: newValue, active: true };
      return newFilters;
    });
  };

  // Reset all PC filters
  const resetAllPCFilters = () => {
    setPCFilters({});
    const resetValues = {};
    Object.keys(pcMpIdOptions).forEach((pc) => {
      resetValues[pc] = 1;
    });
    setSliderValues(resetValues);
  };

  const getCurrentSliderValue = (pc) => {
    return sliderValues[pc] || 1;
  };

  return (
    <ControlSection
      title="PC Filters"
      tooltip="Filter cells based on Principal Component mpId values. Use sliders to select values 1-9. Only one PC filter can be active at a time. Cells matching the selected value will be colored normally, while others will appear gray."
      sidebarCollapsed={sidebarCollapsed}
      showTooltip={showTooltip}
      hideTooltip={hideTooltip}
      disabled={disabled}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* PC mpId Filter Sliders */}
        {Object.entries(pcMpIdOptions).map(([pc, config]) => {
          const currentValue = getCurrentSliderValue(pc);
          const isActive = pcFilters[pc] && pcFilters[pc].active;

          return (
            <div
              key={pc}
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "8px",
                padding: "12px",
                background: isActive ? "rgba(0, 150, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px",
                border: isActive ? "1px solid rgba(0, 150, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.2s ease"
              }}
            >
              {/* PC Label */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{ 
                    fontSize: "12px", 
                    fontWeight: "500", 
                    color: isActive ? "#4fc3f7" : "#fff" 
                  }}
                >
                  {config.name}
                </span>
              </div>

              {/* Slider Container */}
              <div style={{ position: "relative", padding: "0 4px" }}>
                {/* Hash marks with labels */}
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "0",
                    right: "0",
                    height: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                    pointerEvents: "none",
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                    <div
                      key={value}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      <div
                        style={{
                          width: "2px",
                          height: "4px",
                          background: currentValue === value ? "#4fc3f7" : "rgba(255, 255, 255, 0.3)",
                          borderRadius: "1px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          color: currentValue === value ? "#4fc3f7" : "rgba(255, 255, 255, 0.5)",
                          fontWeight: currentValue === value ? "600" : "400",
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="1"
                  max="9"
                  step="1"
                  value={currentValue}
                  onChange={(e) => handleSliderChange(pc, e.target.value)}
                  style={{
                    width: "calc(100% + 8px)",
                    height: "6px",
                    background: `linear-gradient(to right, #4fc3f7 0%, #4fc3f7 ${((currentValue - 1) / 8) * 100}%, rgba(255, 255, 255, 0.1) ${((currentValue - 1) / 8) * 100}%, rgba(255, 255, 255, 0.1) 100%)`,
                    outline: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                    WebkitAppearance: "none",
                    appearance: "none",
                    margin: "0 -4px",
                    padding: "0",
                    position: "relative",
                  }}
                />

              </div>

            </div>
          );
        })}

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
            onClick={resetAllPCFilters}
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
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        input[type="range"]::-webkit-slider-track {
          background: transparent;
          height: 6px;
          border-radius: 3px;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #4fc3f7;
          cursor: pointer;
          border: none;
          box-shadow: none;
        }
        
        input[type="range"]::-moz-range-track {
          background: transparent;
          height: 6px;
          border-radius: 3px;
          border: none;
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #4fc3f7;
          cursor: pointer;
          border: none;
          box-shadow: none;
        }
      `}</style>
    </ControlSection>
  );
};

export default PCFilterSection;
