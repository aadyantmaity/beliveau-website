import React from "react";
import { Database } from "@phosphor-icons/react";
import ControlSection from "./ControlSection";
import ControlButton from "./ControlButton";

function DatasetSection({
  csvFiles,
  activeTab,
  handleTabChange,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
}) {
  return (
    <ControlSection
      title="Dataset"
      icon={Database}
      tooltip="Select different dataset sizes to explore. Larger datasets show more data points but may require more processing time. The 500k dataset automatically samples 100k points for optimal performance."
      sidebarCollapsed={sidebarCollapsed}
      showTooltip={showTooltip}
      hideTooltip={hideTooltip}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {csvFiles.map((file) => (
          <ControlButton
            key={file.id}
            onClick={() => handleTabChange(file.id)}
            isActive={activeTab === file.id}
          >
            {file.name}
          </ControlButton>
        ))}
      </div>
    </ControlSection>
  );
}

export default DatasetSection;
