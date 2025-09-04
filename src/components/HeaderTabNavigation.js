import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./HeaderTabNavigation.css";

const HeaderTabNavigation = () => {
  const location = useLocation();

  const tabs = [
    {
      id: "5k",
      name: "5K Points",
      path: "/",
    },
    {
      id: "25k",
      name: "25K Points",
      path: "/25k",
    },
    {
      id: "50k",
      name: "50K Points",
      path: "/50k",
    },
  ];

  return (
    <div className="header-tab-navigation">
      <div className="tab-container">
        {tabs.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            (tab.id === "5k" && location.pathname === "/");

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`header-tab ${isActive ? "active" : ""}`}
            >
              <div className="tab-content">
                <span className="tab-name">{tab.name}</span>
              </div>
              {isActive && <div className="active-indicator" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default HeaderTabNavigation;
