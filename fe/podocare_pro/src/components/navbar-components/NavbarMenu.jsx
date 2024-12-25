import React from 'react'
import MenuItem from './MenuItem'
import menuItems from  './menuItems'

const NavbarMenu = () => {


  return (
    <nav className="navbar-menu">
            {menuItems.map((item) => (
                <MenuItem 
                    key={item.name} 
                    name={item.name} 
                    href={item.href} 
                    src={item.src}
                    alt={item.alt}                 
                />
            ))}
    </nav>
  )
}

export default NavbarMenu
