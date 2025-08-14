import React from "react";

function ControlButton({ onClick, isActive, children, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 12px",
        background: isActive
          ? "rgba(255, 255, 255, 0.15)"
          : "rgba(255, 255, 255, 0.03)",
        color: "white",
        border: isActive
          ? "1px solid rgba(255, 255, 255, 0.2)"
          : "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "13px",
        textAlign: "left",

        fontWeight: isActive ? "500" : "400",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.target.style.background = "rgba(255, 255, 255, 0.08)";
          e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.target.style.background = "rgba(255, 255, 255, 0.03)";
          e.target.style.borderColor = "rgba(255, 255, 255, 0.05)";
        }
      }}
    >
      {children}
    </button>
  );
}

export default ControlButton;
