import React from 'react'

const MenuItem = ({ name, href, src, alt }) => {
  return (
    <button className="menu-button">
        <img className="menuItem-icon" src={src} alt={alt}/>
        <a href={href} className="menu-a">
          {name}
        </a>
    </button>
  )
}

export default MenuItem
