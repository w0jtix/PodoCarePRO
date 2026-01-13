import React, { useEffect } from "react";
import ModulesNavigationBar from "./ModulesNavigationBar";
import OrderCreate from "./OrderCreate";
import { useState } from "react";
import OrderHistory from "./OrderHistory";
import { ORDER_SUBMENU_ITEMS, SubModuleType } from "../../constants/modules"

export function OrdersDashboard () {
  const [moduleVisible, setModuleVisible] = useState<SubModuleType>("Create");
  const submenuItems = ORDER_SUBMENU_ITEMS;

  return (
    <div className="dashboard-panel width-85 height-max flex-column align-items-center">
      <ModulesNavigationBar        
        setModuleVisible={setModuleVisible} 
        submenuItems={submenuItems}
        />
      {moduleVisible === "Create" && <OrderCreate />}
      {moduleVisible === "History" && <OrderHistory />}
    </div>
  );
};

export default OrdersDashboard;
