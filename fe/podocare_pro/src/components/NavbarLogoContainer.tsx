import React from 'react'

export interface NavbarLogoContainerProps {
  logoSrc?: string;
  logoAlt?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function NavbarLogoContainer ({  
  logoSrc = "src/assets/stopy.svg",
  logoAlt = "podocare-stopy-logo",
  title = "PodoCare",
  subtitle = "PRO",
  className = "",
}: NavbarLogoContainerProps) {

  const content = (
    <>
      <img src={logoSrc} alt={logoAlt} />
      <section className="text-field">
        <h1>{title}</h1>
        {subtitle && <h2>{subtitle}</h2>}
      </section>
    </>
  );


  return (
    <div className={`navbar-logo-container ${className}`}>
        {content}
    </div>
  )
}

export default NavbarLogoContainer
