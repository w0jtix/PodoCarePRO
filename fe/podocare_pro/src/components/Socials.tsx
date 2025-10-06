import React from 'react'
import { SOCIAL_ITEMS, getIconPath, getIconAlt } from '../constants/socials'

export function Socials () {

  return (
    <div className="socials">
      {SOCIAL_ITEMS.map((site) => (
        <a 
        key={site.name} 
        href={site.href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="social-link"
        >
            <img 
                src={getIconPath(site.icon)} 
                alt={getIconAlt(site.icon)} 
                className="social-icon" 
            />
        </a>     
      ))}
    </div>
  )
}

export default Socials
