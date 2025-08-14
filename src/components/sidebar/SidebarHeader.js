import React from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

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
          <h3
            style={{
              margin: "0",
              fontSize: "18px",
              fontWeight: "500",
              letterSpacing: "0.5px",
            }}
          >
            Filters
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
      >
        {sidebarCollapsed ? <CaretRight size={20} /> : <CaretLeft size={20} />}
      </button>
    </div>
  );
}

export default SidebarHeader;
