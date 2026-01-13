import React from "react";
import { useState, useCallback } from "react";
import { ORDER_SUBMENU_ITEMS, getIconPath, getIconAlt, SubModuleType, SubMenuItem } from "../constants/modules";

export interface SubMenuNavbarProps {
  setModuleVisible: (module: SubModuleType) => void;
  className?: string;
  defaultSelected?: string;
  submenuItems: SubMenuItem[];
}

export function SubMenuNavbar ( { 
  setModuleVisible,
  className = "",
  submenuItems,
  defaultSelected = submenuItems[0].name,
}: SubMenuNavbarProps ) {
  const [selectedItem, setSelectedItem] = useState<string>(defaultSelected);

  const handleItemClick = useCallback((item: SubMenuItem) => {
    setModuleVisible(item.module);
    setSelectedItem(item.name);
  }, [setModuleVisible])


  return (
    <div className={`submenu-navbar ${className} height-max flex align-self-center`}>
      {submenuItems.map((menuItem) => (
        <div 
          key={menuItem.name} 
          className={`submenu-navbar-button-div relative width-fit-content ${
            selectedItem === menuItem.name ? "selected" : ""
        }`}>
          <button 
          className="submenu-navbar-menuItem-button relative height-max pointer border-none flex align-items-center justify-center"
          onClick={() => handleItemClick(menuItem)}
          >
            <div className="submenu-navbar-menuItem-button-interior flex align-items-center justify-center pr-15px">
              <img
                className="submenu-order-icon align-self-center justify-self-center mr-5px"
                src={getIconPath(menuItem.icon)}
                alt={menuItem.alt || getIconAlt(menuItem.icon)}
              ></img>
              <a className="submenu-navbar-menuItem-button-a align-self-center">
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
