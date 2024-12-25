import React from 'react'
import NavbarLogoContainer from './navbar-components/NavbarLogoContainer'
import NavbarMenu from './navbar-components/NavbarMenu'
import Socials from './navbar-components/Socials'


const Navbar = () => {
  return (
    <div className="navbar">
        <NavbarLogoContainer/>
        <NavbarMenu/>
        <Socials/>
    </div>
  )
}

export default Navbar
