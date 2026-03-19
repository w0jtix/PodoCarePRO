import magazynIcon from "../assets/magazyn.svg";
import cashRegisterIcon from "../assets/cash_register.svg";
import zamowieniaIcon from "../assets/zamówienia.svg";
import cennikIcon from "../assets/cennik.svg";
import uslugiIcon from "../assets/uslugi.svg";
import klienciIcon from "../assets/klienci.svg";
import wizytaIcon from "../assets/wizyty.svg";
import firmaIcon from "../assets/firma.svg";
import ustawieniaIcon from "../assets/ustawienia.svg";
import plusIcon from "../assets/plus.svg";
import listIcon from "../assets/list.svg";
import productsIcon from "../assets/products.svg";
import checkListIcon from "../assets/check_list.svg";
import employeesIcon from "../assets/employees.svg";
import bonusIcon from "../assets/bonus.svg";
import chartIcon from "../assets/chart.svg";
import logoutIcon from "../assets/logout.svg";

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
  { name: "Magazyn", href: '/', icon: magazynIcon, subItems: [
    { name: "Produkty", module: 'Products' },
    { name: "Raporty Stanu Mag.", module: 'InventoryReport' },
  ]},
  { name: "Kasetka", href: '/cash-ledger', icon: cashRegisterIcon },
  { name: "Zamówienia", href: '/orders', icon: zamowieniaIcon, subItems: [
    { name: "Kreator", module: 'Create' },
    { name: "Historia", module: 'History' },
  ]},
  { name: "Cennik", href: '/pricelist', icon: cennikIcon},
  { name: "Usługi", href: '/services', icon: uslugiIcon},
  { name: "Klienci", href: '/clients', icon: klienciIcon },
  { name: "Wizyty", href: '/visits', icon: wizytaIcon },
  { name: "Firma", href: '/my-company', icon: firmaIcon, permissions: ['ROLE_ADMIN'], subItems: [
    { name: "Faktury Kosztowe", module: 'Expenses' },
    { name: "Pracownicy", module: 'Employees' },
    { name: "Premie", module: 'EmployeeBonus' },
    { name: "Statystyki", module: 'Statistics' },
    { name: "Ustawienia firmowe", module: 'CompanySettings' },
  ]},
  { name: "Ustawienia", href: '/settings', icon: ustawieniaIcon, permissions: ['ROLE_ADMIN'] },
];

export const getIconAlt = (iconName: string): string => {
  return `${iconName}-icon`;
};

export type SubModuleType = 'Create' | 'History' | 'Expenses' | 'Statistics' | 'Employees' | 'EmployeeBonus' | 'CompanySettings' | 'Products' | 'InventoryReport' | 'PriceListServices' | 'PriceListProducts';

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
    icon: plusIcon,
    alt: 'submenu-add'
  },
  {
    name: "Historia",
    module: 'History',
    icon: listIcon,
    alt: 'submenu-list'
  },
];

export const WAREHOUSE_SUBMENU_ITEMS: SubMenuItem[] = [
  {
    name: "Produkty",
    module: 'Products',
    icon: productsIcon,
    alt: 'submenu-products'
  },
  {
    name: "Raporty",
    module: 'InventoryReport',
    icon: checkListIcon,
    alt: 'submenu-inventory-report'
  },
];

export const PRICELIST_SUBMENU_ITEMS: SubMenuItem[] = [
  { name: "Usługi", module: 'PriceListServices', icon: uslugiIcon, alt: 'submenu-services' },
  { name: "Produkty", module: 'PriceListProducts', icon: productsIcon, alt: 'submenu-products' },
];

export const BUSINESS_SUBMENU_ITEMS: SubMenuItem[] = [
  {
    name: "Faktury Kosztowe",
    module: 'Expenses',
    icon: listIcon,
    alt: 'submenu-expenses'
  },
  {
    name: "Pracownicy",
    module: 'Employees',
    icon: employeesIcon,
    alt: 'submenu-calcs'
  },
  {
    name: "Premie",
    module: 'EmployeeBonus',
    icon: bonusIcon,
    alt: 'submenu-bonus'
  },
  {
    name: "Statystyki",
    module: 'Statistics',
    icon: chartIcon,
    alt: 'submenu-stats'
  },
  {
    name: "Ustawienia",
    module: 'CompanySettings',
    icon: ustawieniaIcon,
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
    icon: klienciIcon,
    className: "profile-icon"
  },
  {
    label: "Ustawienia",
    icon: ustawieniaIcon,
    className: "settings-icon",
    permissions: ['ROLE_ADMIN']
  },
  {
    label: "Wyloguj",
    icon: logoutIcon,
    className: "logout-icon"
  }
];