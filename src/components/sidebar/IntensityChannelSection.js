import React from "react";
import { ChartLine } from "@phosphor-icons/react";
import ControlSection from "./ControlSection";
import ControlButton from "./ControlButton";

function IntensityChannelSection({
  intensityChannel,
  setIntensityChannel,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
}) {
  return (
    <ControlSection
      title="Intensity Channel"
      icon={ChartLine}
      tooltip="Select which intensity measurement to use for coloring and filtering. Each channel represents different measurements from the dataset (mean_intensity-0, mean_intensity-1, or mean_intensity-2)."
      sidebarCollapsed={sidebarCollapsed}
      showTooltip={showTooltip}
      hideTooltip={hideTooltip}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <ControlButton
          onClick={() => setIntensityChannel("channel_0")}
          isActive={intensityChannel === "channel_0"}
        >
          Channel 0 (mean_intensity-0)
        </ControlButton>
        <ControlButton
          onClick={() => setIntensityChannel("channel_1")}
          isActive={intensityChannel === "channel_1"}
        >
          Channel 1 (mean_intensity-1)
        </ControlButton>
        <ControlButton
          onClick={() => setIntensityChannel("channel_2")}
          isActive={intensityChannel === "channel_2"}
        >
          Channel 2 (mean_intensity-2)
        </ControlButton>
      </div>
    </ControlSection>
  );
}

export default IntensityChannelSection;
