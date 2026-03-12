import React, { useEffect } from "react";
import ModulesNavigationBar from "./ModulesNavigationBar";
import OrderCreate from "./OrderCreate";
import { useState } from "react";
import OrderHistory from "./OrderHistory";
import { ORDER_SUBMENU_ITEMS, SubModuleType } from "../../constants/modules"
import { useLocation } from "react-router-dom";

export function OrdersDashboard () {
  const location = useLocation();
  const [moduleVisible, setModuleVisible] = useState<SubModuleType>("Create");
  const submenuItems = ORDER_SUBMENU_ITEMS;

  useEffect(() => {
    const stateModule = (location.state as { module?: string })?.module;
    if (stateModule === "Create" || stateModule === "History") {
      setModuleVisible(stateModule);
    }
  }, [location.state]);

  return (
    <div className="dashboard-panel width-85 height-max flex-column align-items-center">
      <ModulesNavigationBar
        setModuleVisible={setModuleVisible}
        submenuItems={submenuItems}
        activeModule={moduleVisible}
        />
      {moduleVisible === "Create" && <OrderCreate />}
      {moduleVisible === "History" && <OrderHistory />}
    </div>
  );
};

export default OrdersDashboard;
