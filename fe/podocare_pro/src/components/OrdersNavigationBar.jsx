import React from "react";
import SubMenuNavbar from "./SubMenuNavbar";
import UserMenu from "./UserMenu";

const OrdersNavigationBar = ({ onFilter, orderFilterDTO }) => {
  return (
    <div className="orders-navigation-bar">
      <SubMenuNavbar />
      <UserMenu />
    </div>
  );
};

export default OrdersNavigationBar;
