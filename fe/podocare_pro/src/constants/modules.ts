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
  /* { name: "Utarg", href: '/utarg', icon: 'utarg' }, */
  { name: "Cennik", href: '/cennik', icon: 'cennik'},
  { name: "Usługi", href: '/uslugi', icon: 'uslugi'},
  { name: "Klienci", href: '/klienci', icon: 'klienci' },
  { name: "Wizyty", href: '/wizyty', icon: 'wizyty' },
  /* { name: "Statystyki", href: '/statystyki', icon: 'statystyki'}, */
  { name: "Firma", href: '/moja-firma', icon: 'firma', permissions: ['ROLE_ADMIN'] },
  { name: "Ustawienia", href: '/ustawienia', icon: 'ustawienia', permissions: ['ROLE_ADMIN'] },
];

export const getIconPath = (iconName: string): string => {
  return `src/assets/${iconName}.svg`;
};

export const getIconAlt = (iconName: string): string => {
  return `${iconName}-icon`;
};

export type SubModuleType = 'Create' | 'History' | 'Common' | 'Stats' | 'Calculations';

export interface SubMenuItem {
  name: string;
  module: SubModuleType;
  icon: string;
  alt?: string;
}

export const ORDER_SUBMENU_ITEMS: SubMenuItem[] = [
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

export const BUSINESS_SUBMENU_ITEMS: SubMenuItem[] = [
  { 
    name: "Ogólne", 
    module: 'Common', 
    icon: 'list',
    alt: 'submenu-common'
  },
  { 
    name: "Kalkulatory", 
    module: 'Calculations', 
    icon: 'math',
    alt: 'submenu-calcs'
  },
  { 
    name: "Statystyki", 
    module: 'Stats', 
    icon: 'chart',
    alt: 'submenu-stats'
  },
];

export interface UserMenuItem {
  label: string;
  icon: string;
  className?: string;
  permissions?: string[];
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
    className: "settings-icon",
    permissions: ['ROLE_ADMIN']
  },
  {
    label: "Wyloguj",
    icon: "logout",
    className: "logout-icon"
  }
];