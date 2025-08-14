import React from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

function SidebarHeader({ sidebarCollapsed, setSidebarCollapsed }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: sidebarCollapsed ? "center" : "flex-end",
        marginBottom: sidebarCollapsed ? "0" : "12px",
        padding: sidebarCollapsed ? "0" : "16px 24px 0 24px",
        height: sidebarCollapsed ? "36px" : "auto",
      }}
    >
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

          minWidth: "32px",
          minHeight: "32px",
        }}
      >
        {sidebarCollapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}
      </button>
    </div>
  );
}

export default SidebarHeader;
