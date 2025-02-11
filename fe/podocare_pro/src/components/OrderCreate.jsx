import React from "react";
import OrderCreator from "./OrderCreator";
import OrdersListBySupplier from "./OrdersListBySupplier";
import { useState } from "react";

const OrderCreate = () => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  return (
    <div className="orders-container">
      <OrderCreator
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={setSelectedSupplier}
      />
      <OrdersListBySupplier selectedSupplier={selectedSupplier} />
    </div>
  );
};

export default OrderCreate;
