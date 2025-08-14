import React from "react";
import { Cube, CaretLeft, CaretRight } from "@phosphor-icons/react";

function SidebarHeader({ sidebarCollapsed, setSidebarCollapsed }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: sidebarCollapsed ? "center" : "space-between",
        marginBottom: sidebarCollapsed ? "0" : "20px",
      }}
    >
      {!sidebarCollapsed && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "opacity 0.3s ease",
          }}
        >
          <Cube size={20} weight="fill" />
          <h3
            style={{
              margin: "0",
              fontSize: "18px",
              fontWeight: "500",
              letterSpacing: "0.5px",
            }}
          >
            Beliveau 3D Visualizer
          </h3>
        </div>
      )}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          padding: "8px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.2s ease",
          minWidth: "32px",
          minHeight: "32px",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "transparent";
        }}
      >
        {sidebarCollapsed ? <CaretRight size={20} /> : <CaretLeft size={20} />}
      </button>
    </div>
  );
}

export default SidebarHeader;
