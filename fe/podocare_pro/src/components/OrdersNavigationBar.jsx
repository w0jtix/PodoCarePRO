import React from "react";
import SubMenuNavbar from "./SubMenuNavbar";
import UserMenu from "./UserMenu";

const OrdersNavigationBar = () => {
  return (
    <div className="orders-navigation-bar">
      <section className="navigation-bar-interior">
        <SubMenuNavbar />
        <UserMenu />
      </section>
    </div>
  );
};

export default OrdersNavigationBar;
