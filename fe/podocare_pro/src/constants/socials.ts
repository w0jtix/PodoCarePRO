export interface SocialItem {
  name: string;
  href: string;
  icon: string;
}

export const SOCIAL_ITEMS: SocialItem[] = [
  { name: "Website", href: "https://podocare.com.pl/", icon: 'website' },
  { name: "Instagram", href: "https://www.instagram.com/podocare.poznan/", icon: 'instagram' },
  { name: "Facebook", href: "https://www.facebook.com/podocare.poznan", icon: 'facebook' },

];

export const getIconPath = (iconName: string): string => {
  return `src/assets/${iconName}_icon.svg`;
};

export const getIconAlt = (iconName: string): string => {
  return `${iconName}-icon`;
};