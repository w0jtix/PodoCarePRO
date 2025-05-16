import React from "react";
import { useState } from "react";


const SubMenuNavbar = ( { setModuleVisible } ) => {
  const [selectedItem, setSelectedItem] = useState("Kreator");
  const menuItems = [
    {
      name: "Kreator",
      src: "src/assets/plus.svg",
      alt: "submenu-add",
      func: () => {
        setModuleVisible("Create");
        setSelectedItem("Kreator");
      },
    },
    {
      name: "Historia",
      src: "src/assets/list.svg",
      alt: "submenu-list",
      func: () => {
        setModuleVisible("History");
        setSelectedItem("Historia");
      },
    },
  ];

  return (
    <div className="submenu-navbar">
      {menuItems.map((menuItem, index) => (
        <div key={index} className={`submenu-navbar-button-div ${
          selectedItem === menuItem.name ? "selected" : ""
        }`}>
          <button 
          className="submenu-navbar-menuItem-button"
          onClick={menuItem.func}
          >
            <div className="submenu-navbar-menuItem-button-interior">
              <img
                className="submenu-order-icon"
                src={menuItem.src}
                alt={menuItem.alt}
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
