import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  USER_MENU_ITEMS,
  UserMenuAction,
  getIconPath,
  getIconAlt,
} from "../constants/modules";

export interface UserMenuProps {
  username?: string;
  userImage?: string;
  onMenuAction?: (action: UserMenuAction) => void;
  className?: string;
}

export function UserMenu({
  username = "User", //default
  userImage = "src/assets/user_profile_picture.png", //default
  onMenuAction,
  className = "",
}: UserMenuProps) {
  const [isMenuVisible, setMenuVisible] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = useCallback(() => {
    setMenuVisible((prev) => !prev);
  }, []);

  const handleMenuItemClick = (action: UserMenuAction) => {
    if (onMenuAction) {
      onMenuAction(action);
    }
    setMenuVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`user-menu ${className}`} ref={menuRef}>
      <button className="dropdown-button" onClick={toggleMenu}>
        <img
          src={userImage}
          alt={`${username} profile picture`}
          className="user-pfp"
        />
        <h2 className="username">{username}</h2>
        <img
          src="src/assets/arrow_down.svg"
          alt="arrow down"
          className={`arrow-down ${isMenuVisible ? "rotated" : ""}`}
        />
      </button>
      {isMenuVisible && (
        <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
          <ul className="user-menu-dropdown-list">
            {USER_MENU_ITEMS.map((item) => (
              <li
                key={item.action}
                className="dropdown-item-user-menu"
                onClick={() => handleMenuItemClick(item.action)}
              >
                <img
                  src={getIconPath(item.icon)}
                  alt={getIconAlt(item.icon)}
                  className={item.className}
                />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
