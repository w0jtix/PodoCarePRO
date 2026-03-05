import AuthService from "../services/AuthService";

export interface MenuSubItem {
  name: string;
  module: string;
}

export interface MenuItem {
  name: string;
  href: string;
  icon: string;
  permissions?: string[];
  subItems?: MenuSubItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  { name: "Magazyn", href: '/', icon: 'magazyn', subItems: [
    { name: "Produkty", module: 'Products' },
    { name: "Raporty Stanu Mag.", module: 'InventoryReport' },
  ]},
  { name: "Kasetka", href: '/cash-ledger', icon: 'cash_register' },
  { name: "Zamówienia", href: '/orders', icon: 'zamówienia', subItems: [
    { name: "Kreator", module: 'Create' },
    { name: "Historia", module: 'History' },
  ]},
  { name: "Cennik", href: '/pricelist', icon: 'cennik'},
  { name: "Usługi", href: '/services', icon: 'uslugi'},
  { name: "Klienci", href: '/clients', icon: 'klienci' },
  { name: "Wizyty", href: '/visits', icon: 'wizyty' },
  { name: "Firma", href: '/my-company', icon: 'firma', permissions: ['ROLE_ADMIN'], subItems: [
    { name: "Faktury Kosztowe", module: 'Expenses' },
    { name: "Pracownicy", module: 'Employees' },
    { name: "Premie", module: 'EmployeeBonus' },
    { name: "Statystyki", module: 'Statistics' },
    { name: "Ustawienia firmowe", module: 'CompanySettings' },
  ]},
  { name: "Ustawienia", href: '/settings', icon: 'ustawienia', permissions: ['ROLE_ADMIN'] },
];

export const getIconPath = (iconName: string): string => {
  return `src/assets/${iconName}.svg`;
};

export const getIconAlt = (iconName: string): string => {
  return `${iconName}-icon`;
};

export type SubModuleType = 'Create' | 'History' | 'Expenses' | 'Statistics' | 'Employees' | 'EmployeeBonus' | 'CompanySettings' | 'Products' | 'InventoryReport';

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

export const WAREHOUSE_SUBMENU_ITEMS: SubMenuItem[] = [
  {
    name: "Produkty",
    module: 'Products',
    icon: 'products',
    alt: 'submenu-products'
  },
  {
    name: "Raporty",
    module: 'InventoryReport',
    icon: 'check_list',
    alt: 'submenu-inventory-report'
  },
];

export const BUSINESS_SUBMENU_ITEMS: SubMenuItem[] = [
  { 
    name: "Faktury Kosztowe", 
    module: 'Expenses', 
    icon: 'list',
    alt: 'submenu-expenses'
  },
  { 
    name: "Pracownicy", 
    module: 'Employees', 
    icon: 'employees',
    alt: 'submenu-calcs'
  },
  { 
    name: "Premie", 
    module: 'EmployeeBonus', 
    icon: 'bonus',
    alt: 'submenu-bonus'
  },
  { 
    name: "Statystyki", 
    module: 'Statistics', 
    icon: 'chart',
    alt: 'submenu-stats'
  },
  { 
    name: "Ustawienia", 
    module: 'CompanySettings', 
    icon: 'ustawienia',
    alt: 'submenu-companySettings'
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