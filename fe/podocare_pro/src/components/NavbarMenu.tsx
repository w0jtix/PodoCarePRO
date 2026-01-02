import React from 'react'
import MenuItem from './MenuItem'
import { MENU_ITEMS, getIconPath, getIconAlt } from '../constants/modules';


export function NavbarMenu () {
  return (
    <nav className="navbar-menu flex-column width-max space-evenly pl-1 align-items-start height-fit-content">
            {MENU_ITEMS.map((item) => (
                <MenuItem 
                    key={item.name} 
                    name={item.name} 
                    href={item.href} 
                    src={getIconPath(item.icon)}
                    alt={getIconAlt(item.icon)}                 
                />
            ))}
    </nav>
  )
}

export default NavbarMenu
