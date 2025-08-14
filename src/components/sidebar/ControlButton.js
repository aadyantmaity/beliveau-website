import React from "react";

function ControlButton({
  onClick,
  isActive,
  children,
  style = {},
  disabled = false,
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        padding: "10px 12px",
        background: isActive
          ? "rgba(255, 255, 255, 0.15)"
          : disabled
          ? "rgba(255, 255, 255, 0.02)"
          : "rgba(255, 255, 255, 0.03)",
        color: disabled ? "rgba(255, 255, 255, 0.4)" : "white",
        border: isActive
          ? "1px solid rgba(255, 255, 255, 0.2)"
          : disabled
          ? "1px solid rgba(255, 255, 255, 0.02)"
          : "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "13px",
        textAlign: "left",
        transition: "all 0.2s ease",
        fontWeight: isActive ? "500" : "400",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isActive && !disabled) {
          e.target.style.background = "rgba(255, 255, 255, 0.08)";
          e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive && !disabled) {
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
