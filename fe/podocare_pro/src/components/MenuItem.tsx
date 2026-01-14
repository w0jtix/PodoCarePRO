import React from 'react'

export interface MenuItemProps {
  name: string;
  href: string;
  src: string;
  alt: string;
}

export function MenuItem ({ name, href, src, alt }: MenuItemProps) {
  return (
    <button className="menu-button flex g-15px p-10px border-none justify-center align-items-center ">
        <img className="menuItem-icon" src={src} alt={alt}/>
        <a href={href} className="menu-a">
          {name}
        </a>
    </button>
  )
}

export default MenuItem
