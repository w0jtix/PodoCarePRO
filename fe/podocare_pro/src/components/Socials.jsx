import React from 'react'

const Socials = () => {

    const socials = [
        {name:"Website", href: "https://podocare.com.pl/"},
        {name: "Instagram", href: "https://www.instagram.com/podocare.poznan/"},
        {name: "Facebook", href: "https://www.facebook.com/podocare.poznan"}
    ]

    socials.forEach((site) => {
        site.src = `src/assets/${site.name.toLowerCase()}_icon.svg`;
        site.alt = `${site.name.toLowerCase()}-icon`;
    });

  return (
    <div className="socials">
      {socials.map((site) => (
        <a 
        key={site.name} 
        href={site.href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="social-link"
        >
            <img 
                src={site.src} 
                alt={site.alt} 
                className="social-icon" 
            />
        </a>     
      ))}
    </div>
  )
}

export default Socials
