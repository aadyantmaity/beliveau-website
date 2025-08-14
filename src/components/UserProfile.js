import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./UserProfile.css";

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (!currentUser) return null;

  return (
    <div className="user-profile" ref={dropdownRef}>
      <div className="user-avatar" onClick={toggleDropdown}>
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt="Profile"
            className="avatar-image"
          />
        ) : (
          <div className="avatar-placeholder">
            {currentUser.displayName
              ? currentUser.displayName.charAt(0).toUpperCase()
              : currentUser.email.charAt(0).toUpperCase()}
          </div>
        )}
        <svg className="dropdown-arrow" viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </div>

      {isDropdownOpen && (
        <div className="user-dropdown">
          <div className="user-info">
            <div className="user-name">{currentUser.displayName || "User"}</div>
            <div className="user-email">{currentUser.email}</div>
          </div>
          <div className="dropdown-divider"></div>
          <button onClick={handleLogout} className="logout-button">
            <svg className="logout-icon" viewBox="0 0 24 24">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
