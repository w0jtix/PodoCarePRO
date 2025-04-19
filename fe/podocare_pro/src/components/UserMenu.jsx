import React from "react";
import { useState, useEffect, useRef } from "react";

const UserMenu = () => {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setMenuVisible((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="dropdown-button" onClick={toggleMenu}>
        <img
          src="src/assets/user_profile_picture.png"
          alt="profile picture"
          className="user-pfp"
        />
        <h2 className="username">User</h2>
        <img
          src="src/assets/arrow_down.svg"
          alt="arrow down"
          className={`arrow-down ${isMenuVisible ? "rotated" : ""}`}
        />
      </button>
      {isMenuVisible && (
        <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
          <ul className="user-menu-dropdown-list">
            <li className="dropdown-item-user-menu">
              <img
                src="src/assets/klienci_icon.svg"
                alt="Logout"
                className="profile-icon"
              />
              Profil
            </li>
            <li className="dropdown-item-user-menu">
              <img
                src="src/assets/ustawienia_icon.svg"
                alt="Logout"
                className="settings-icon"
              />
              Ustawienia
            </li>
            <li className="dropdown-item-user-menu">
              <img
                src="src/assets/logout.svg"
                alt="Logout"
                className="logout-icon"
              />
              Wyloguj
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
