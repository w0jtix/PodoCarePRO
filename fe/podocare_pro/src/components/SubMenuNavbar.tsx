import { useCallback } from "react";
import { SubModuleType, SubMenuItem } from "../constants/modules";

export interface SubMenuNavbarProps {
  setModuleVisible: (module: SubModuleType) => void;
  className?: string;
  activeModule?: SubModuleType;
  submenuItems: SubMenuItem[];
}

export function SubMenuNavbar ( {
  setModuleVisible,
  className = "",
  submenuItems,
  activeModule,
}: SubMenuNavbarProps ) {
  const resolvedActive = activeModule || submenuItems[0].module;

  const handleItemClick = useCallback((item: SubMenuItem) => {
    setModuleVisible(item.module);
  }, [setModuleVisible])


  return (
    <div className={`submenu-navbar ${className} height-max flex align-self-center`}>
      {submenuItems.map((menuItem) => (
        <div 
          key={menuItem.name} 
          className={`submenu-navbar-button-div relative width-fit-content ${
            resolvedActive === menuItem.module ? "selected" : ""
        }`}>
          <button 
          className="submenu-navbar-menuItem-button relative height-max pointer border-none flex align-items-center justify-center"
          onClick={() => handleItemClick(menuItem)}
          >
            <div className="submenu-navbar-menuItem-button-interior flex align-items-center justify-center pr-15px">
              <img
                className="submenu-order-icon align-self-center justify-self-center mr-5px"
                src={menuItem.icon}
                alt={menuItem.alt || menuItem.name}
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
