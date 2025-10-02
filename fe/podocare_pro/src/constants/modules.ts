import AuthService from "../services/AuthService";

export interface MenuItem {
  name: string;
  href: string;
  icon: string;
  permissions?: string[];
}

export const MENU_ITEMS: MenuItem[] = [
  { name: "Magazyn", href: '/', icon: 'magazyn' },
  { name: "Zamówienia", href: '/zamowienia', icon: 'zamówienia' },
  { name: "Utarg", href: '/utarg', icon: 'utarg' },
  { name: "Klienci", href: '/klienci', icon: 'klienci' },
  { name: "Grafik", href: '/grafik', icon: 'grafik' },
  { name: "Ustawienia", href: '/ustawienia', icon: 'ustawienia' },
];

export const getIconPath = (iconName: string): string => {
  return `src/assets/${iconName}.svg`;
};

export const getIconAlt = (iconName: string): string => {
  return `${iconName}-icon`;
};

export type SubModuleType = 'Create' | 'History';

export interface SubMenuItem {
  name: string;
  module: SubModuleType;
  icon: string;
  alt?: string;
}

export const SUBMENU_ITEMS: SubMenuItem[] = [
  { 
    name: "Kreator", 
    module: 'Create', 
    icon: 'plus',
    alt: 'submenu-add'
  },
  { 
    name: "Historia", 
    module: 'History', 
    icon: 'list',
    alt: 'submenu-list'
  },
];

export interface UserMenuItem {
  label: string;
  icon: string;
  className?: string;
}

export const USER_MENU_ITEMS: UserMenuItem[] = [
  {
    label: "Profil",
    icon: "klienci",
    className: "profile-icon"
  },
  {
    label: "Ustawienia",
    icon: "ustawienia",
    className: "settings-icon"
  },
  {
    label: "Wyloguj",
    icon: "logout",
    className: "logout-icon"
  }
];