import avatar5 from "../assets/avatars/avatar5.png";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  USER_MENU_ITEMS,
  getIconPath,
  getIconAlt,
} from "../constants/modules";
import AuthService from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import { AVAILABLE_AVATARS } from "../constants/avatars";

export interface UserMenuProps {
  username?: string;
  avatar?: string;
  className?: string;
}

export function UserMenu({
  username,
  avatar,
  className = "",
}: UserMenuProps) {
  const [isMenuVisible, setMenuVisible] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const currentUser = AuthService.getCurrentUser();
  const displayUsername = username ?? currentUser?.username;
  const displayAvatar =
    avatar
      ? AVAILABLE_AVATARS[avatar]
      : currentUser?.avatar
      ? AVAILABLE_AVATARS[currentUser.avatar]
      : avatar5;

   const handleAction = (label: string) => {
    switch (label) {
      case "Profil":
        navigate("/profile");
        break;
      case "Ustawienia":
        navigate("/settings");
        break;
      case "Wyloguj":
        AuthService.logout();
        break;
    }
    setMenuVisible(false);
  };

  const toggleMenu = useCallback(() => {
    setMenuVisible((prev) => !prev);
  }, []);

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
          src={displayAvatar}
          alt={`${username} profile picture`}
          className="user-pfp"
        />
        <h2 className="username">{displayUsername}</h2>
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
                key={item.label}
                className="dropdown-item-user-menu"
                onClick={() => handleAction(item.label)}
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
