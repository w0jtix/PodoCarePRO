import React from "react";
import SubMenuNavbar from "../SubMenuNavbar";
import UserMenu from "../UserMenu";
import { SubModuleType } from "../../constants/modules";

export interface OrdersNavigationBarProps {
  setModuleVisible: (module: SubModuleType) => void;
}

export function OrdersNavigationBar ({ setModuleVisible }: OrdersNavigationBarProps) {
  return (
    <div className="orders-navigation-bar">
      <section className="navigation-bar-interior">
        <SubMenuNavbar setModuleVisible={setModuleVisible} />
        <UserMenu />
      </section>
    </div>
  );
};

export default OrdersNavigationBar;
