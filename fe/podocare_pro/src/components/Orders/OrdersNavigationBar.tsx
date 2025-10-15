import React from "react";
import SubMenuNavbar from "../SubMenuNavbar";
import UserMenu from "../UserMenu";
import { SubModuleType } from "../../constants/modules";

export interface OrdersNavigationBarProps {
  setModuleVisible: (module: SubModuleType) => void;
}

export function OrdersNavigationBar ({ setModuleVisible }: OrdersNavigationBarProps) {
  return (
    <div className="orders-navigation-bar height-fit-content flex justify-center relative width-93">
      <section className="navigation-bar-interior flex align-items-center space-between width-93 height-fit-content m-0-auto">
        <SubMenuNavbar setModuleVisible={setModuleVisible} />
        <UserMenu />
      </section>
    </div>
  );
};

export default OrdersNavigationBar;
