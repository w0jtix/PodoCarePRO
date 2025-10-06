import React from "react";
import { useState, useCallback } from "react";
import { SUBMENU_ITEMS, getIconPath, getIconAlt, SubModuleType, SubMenuItem } from "../constants/modules";

export interface SubMenuNavbarProps {
  setModuleVisible: (module: SubModuleType) => void;
  className?: string;
  defaultSelected?: string;
}

export function SubMenuNavbar ( { 
  setModuleVisible,
  className = "",
  defaultSelected = "Kreator"
}: SubMenuNavbarProps ) {
  const [selectedItem, setSelectedItem] = useState<string>(defaultSelected);

  const handleItemClick = useCallback((item: SubMenuItem) => {
    setModuleVisible(item.module);
    setSelectedItem(item.name);
  }, [setModuleVisible])


  return (
    <div className={`submenu-navbar ${className}`}>
      {SUBMENU_ITEMS.map((menuItem) => (
        <div 
          key={menuItem.name} 
          className={`submenu-navbar-button-div ${
            selectedItem === menuItem.name ? "selected" : ""
        }`}>
          <button 
          className="submenu-navbar-menuItem-button"
          onClick={() => handleItemClick(menuItem)}
          >
            <div className="submenu-navbar-menuItem-button-interior">
              <img
                className="submenu-order-icon"
                src={getIconPath(menuItem.icon)}
                alt={menuItem.alt || getIconAlt(menuItem.icon)}
              ></img>
              <a className="submenu-navbar-menuItem-button-a">
                {menuItem.name}
              </a>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};

export default SubMenuNavbar;
