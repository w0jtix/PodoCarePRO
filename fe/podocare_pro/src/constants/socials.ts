import websiteIcon from "../assets/website_icon.svg";
import instagramIcon from "../assets/instagram_icon.svg";
import facebookIcon from "../assets/facebook_icon.svg";

export interface SocialItem {
  name: string;
  href: string;
  icon: string;
  alt: string;
}

export const SOCIAL_ITEMS: SocialItem[] = [
  { name: "Website", href: "https://podocare.com.pl/", icon: websiteIcon, alt: "website-icon" },
  { name: "Instagram", href: "https://www.instagram.com/podocare.poznan/", icon: instagramIcon, alt: "instagram-icon" },
  { name: "Facebook", href: "https://www.facebook.com/podocare.poznan", icon: facebookIcon, alt: "facebook-icon" },
];