import React from 'react'
import NavbarLogoContainer from './NavbarLogoContainer'
import NavbarMenu from './NavbarMenu'
import Socials from './Socials'


export function Navbar () {
  return (
    <div className="navbar height-max flex-column align-items-center">
        <NavbarLogoContainer/>
        <NavbarMenu/>
        <Socials/>
    </div>
  )
}

export default Navbar
