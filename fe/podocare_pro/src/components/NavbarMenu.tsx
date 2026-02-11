import React from 'react'
import MenuItem from './MenuItem'
import { MENU_ITEMS, getIconPath, getIconAlt } from '../constants/modules';
import { useUser } from './User/UserProvider';
import { RoleType } from '../models/login';


export function NavbarMenu () {
  const { user } = useUser();

  const hasPermission = (requiredPermissions?: string[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    if (!user || !user.roles) {
      return false;
    }

    return requiredPermissions.some((permission) =>
      user.roles.includes(permission as RoleType)
    );
  };

  const visibleMenuItems = MENU_ITEMS.filter((item) => hasPermission(item.permissions));

  return (
    <nav className="navbar-menu flex-column width-max space-evenly pl-1 align-items-start height-fit-content">
            {visibleMenuItems.map((item) => (
                <MenuItem
                    key={item.name}
                    name={item.name}
                    href={item.href}
                    src={getIconPath(item.icon)}
                    alt={getIconAlt(item.icon)}
                />
            ))}
    </nav>
  )
}

export default NavbarMenu
