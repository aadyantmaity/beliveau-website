import React, { useState, useRef, useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";

function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = "Select option",
  style = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div ref={dropdownRef} style={{ position: "relative", ...style }}>
      {/* Main dropdown button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "10px 12px",
          background: "rgba(255, 255, 255, 0.03)",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "13px",
          textAlign: "left",
          fontWeight: "400",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "rgba(255, 255, 255, 0.08)";
          e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "rgba(255, 255, 255, 0.03)";
          e.target.style.borderColor = "rgba(255, 255, 255, 0.05)";
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <CaretDown
          size={14}
          style={{
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(20, 20, 20, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            marginTop: "4px",
            zIndex: 1000,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            maxHeight: "200px",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                background:
                  value === option.value
                    ? "rgba(74, 144, 226, 0.2)"
                    : "transparent",
                color: value === option.value ? "#4A90E2" : "white",
                border: "none",
                borderRadius: "0",
                cursor: "pointer",
                fontSize: "13px",
                textAlign: "left",
                fontWeight: value === option.value ? "500" : "400",
                transition: "all 0.15s ease",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.target.style.background = "rgba(255, 255, 255, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) {
                  e.target.style.background = "transparent";
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomDropdown;
