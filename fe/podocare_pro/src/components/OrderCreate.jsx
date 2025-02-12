import React from "react";
import OrderCreator from "./OrderCreator";
import OrdersListBySupplier from "./OrdersListBySupplier";
import { useState } from "react";

const OrderCreate = () => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedOrderProduct, setSelectedOrderProduct] = useState();


  return (
    <div className="orders-container">
      <OrderCreator
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={setSelectedSupplier}
        selectedOrderProduct={selectedOrderProduct}
        setSelectedOrderProduct={setSelectedOrderProduct}
      />
      <OrdersListBySupplier
        selectedSupplier={selectedSupplier}
        setSelectedOrderProduct={setSelectedOrderProduct}
      />
    </div>
  );
};

export default OrderCreate;
