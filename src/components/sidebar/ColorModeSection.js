import React from "react";
import { Palette } from "@phosphor-icons/react";
import ControlSection from "./ControlSection";
import ControlButton from "./ControlButton";

function ColorModeSection({
  colorMode,
  setColorMode,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
}) {
  return (
    <ControlSection
      title="Color Mode"
      icon={Palette}
      tooltip="Choose how data points are colored. Intensity-based uses the selected channel's values to create a color gradient, while Uniform gives all points the same color."
      sidebarCollapsed={sidebarCollapsed}
      showTooltip={showTooltip}
      hideTooltip={hideTooltip}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <ControlButton
          onClick={() => setColorMode("intensity")}
          isActive={colorMode === "intensity"}
        >
          Intensity-based
        </ControlButton>
        <ControlButton
          onClick={() => setColorMode("uniform")}
          isActive={colorMode === "uniform"}
        >
          Uniform
        </ControlButton>
      </div>
    </ControlSection>
  );
}

export default ColorModeSection;
