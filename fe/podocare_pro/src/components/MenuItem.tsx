import { useNavigate } from 'react-router-dom'
import arrowDownIcon from "../assets/arrow_down.svg";
import pointerIcon from "../assets/pointer.svg";

export interface SubItem {
  name: string;
  module: string;
}

export interface MenuItemProps {
  name: string;
  href: string;
  src: string;
  alt: string;
  subItems?: SubItem[];
  isOpen?: boolean;
  onToggle?: () => void;
}

export function MenuItem ({ name, href, src, alt, subItems, isOpen = false, onToggle }: MenuItemProps) {
  const navigate = useNavigate();

  if (!subItems || subItems.length === 0) {
    return (
      <button className="menu-button width-max flex g-15px p-0625 border-none justify-start align-items-center ">
        <img className="menuItem-icon" src={src} alt={alt}/>
        <a href={href} className="menu-a">
          {name}
        </a>
      </button>
    );
  }

  const handleSubItemClick = (sub: SubItem) => {
    navigate(href, { state: { module: sub.module } });
    onToggle?.();
  };

  return (
    <div className="menu-item-with-sub">
      <button
        className="menu-button width-max flex g-15px p-0625 border-none justify-start align-items-center pointer"
        onClick={() => onToggle?.()}
      >
        <img className="menuItem-icon" src={src} alt={alt}/>
        <span className="menu-a">{name}</span>
        <img
          src={arrowDownIcon}
          alt="Toggle submenu"
          className={`menu-sub-arrow ${isOpen ? "rotated" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="menu-sub-dropdown flex-column">
          {subItems.map((sub) => (
            <div key={sub.module} className='menu-sub-div flex g-5px align-items-center pointer' onClick={() => handleSubItemClick(sub)}>
              <img className="menu-subitem-icon" src={pointerIcon} alt={"Pointer"}/>
              <span className="menu-sub-item flex align-items-center">
                {sub.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MenuItem
