import React from "react";
import { Mouse, Question } from "@phosphor-icons/react";

function ControlsInfoSection({ sidebarCollapsed, showTooltip, hideTooltip }) {
  if (sidebarCollapsed) return null;

  return (
    <div
      style={{
        fontSize: "12px",
        marginTop: "16px",
        opacity: "0.6",
        padding: "12px",
        background: "rgba(255, 255, 255, 0.02)",
        borderRadius: "6px",
        border: "1px solid rgba(255, 255, 255, 0.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontWeight: "500",
          marginBottom: "8px",
        }}
      >
        <Mouse size={14} />
        Controls
        <Question
          size={12}
          style={{ cursor: "pointer", opacity: "0.6" }}
          onMouseEnter={(e) =>
            showTooltip(
              "Mouse controls for navigating the 3D visualization. Drag to rotate the view around the data points, and scroll to zoom in and out.",
              e
            )
          }
          onMouseLeave={hideTooltip}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "2px",
        }}
      >
        Mouse: Rotate view
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        Scroll: Zoom
      </div>
    </div>
  );
}

export default ControlsInfoSection;
