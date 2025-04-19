import React, { useEffect } from "react";
import OrdersNavigationBar from "./OrdersNavigationBar";
import OrderCreate from "./OrderCreate";
import { useState } from "react";
import OrderHistory from "./OrderHistory";

const OrdersDashboard = () => {
  const [moduleVisible, setModuleVisible] = useState("Create");

  return (
    <div className="dashboard-panel">
      <OrdersNavigationBar setModuleVisible={setModuleVisible} />
      {moduleVisible === "Create" && <OrderCreate />}
      {moduleVisible === "History" && <OrderHistory />}
    </div>
  );
};

export default OrdersDashboard;
