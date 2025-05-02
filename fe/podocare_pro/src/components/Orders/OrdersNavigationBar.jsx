import React from "react";
import SubMenuNavbar from "../SubMenuNavbar";
import UserMenu from "../UserMenu";

const OrdersNavigationBar = ({ setModuleVisible }) => {
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
