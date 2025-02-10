import React from "react";

const SubMenuNavbar = () => {
  const menuItems = [
    {
      name: "Kreator",
      src: "src/assets/plus.svg",
      alt: "submenu-add",
    },
    {
      name: "Historia",
      src: "src/assets/list.svg",
      alt: "submenu-list",
    },
  ];

  return (
    <div className="submenu-navbar">
      {menuItems.map((menuItem, index) => (
        <div className="submenu-navbar-button-div">
          <button key={index} className="submenu-navbar-menuItem-button">
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
