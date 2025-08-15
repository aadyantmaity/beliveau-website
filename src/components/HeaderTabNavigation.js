import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./HeaderTabNavigation.css";

const HeaderTabNavigation = () => {
  const location = useLocation();

  const tabs = [
    {
      id: "5k",
      name: "5K Dataset",
      path: "/5k",
    },
    {
      id: "50k",
      name: "50K Dataset",
      path: "/50k",
    },
    {
      id: "500k",
      name: "500K Dataset",
      path: "/500k",
    },
    {
      id: "all-features",
      name: "50K All Features",
      path: "/all-features",
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
