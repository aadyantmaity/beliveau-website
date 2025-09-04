import React from "react";
import { Question } from "@phosphor-icons/react";

export function ControlSection({
  title,
  icon: Icon,
  tooltip,
  children,
  sidebarCollapsed,
  showTooltip,
  hideTooltip,
}) {
  if (sidebarCollapsed) return null;

  return (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "8px",
          fontSize: "13px",
          fontWeight: "500",
          opacity: "0.9",
        }}
      >
        {Icon && <Icon size={14} />}
        {title}
        {tooltip && (
          <Question
            size={12}
            style={{ cursor: "pointer", opacity: "0.6" }}
            onMouseEnter={(e) => showTooltip(tooltip, e)}
            onMouseLeave={hideTooltip}
          />
        )}
      </label>
      {children}
    </div>
  );
}

export default ControlSection;
