import { SOCIAL_ITEMS } from '../constants/socials'

export function Socials () {

  return (
    <div className="mt-auto flex justify-center g-10px">
      {SOCIAL_ITEMS.map((site) => (
        <a 
        key={site.name} 
        href={site.href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="social-link"
        >
            <img 
                src={site.icon}
                alt={site.alt}
                className="social-icon" 
            />
        </a>     
      ))}
    </div>
  )
}

export default Socials
