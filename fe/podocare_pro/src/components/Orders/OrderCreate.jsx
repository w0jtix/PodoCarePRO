import React from "react";
import OrderCreator from "./OrderCreator";
import OrdersListBySupplier from "./OrdersListBySupplier";
import { useState } from "react";

const OrderCreate = () => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedOrderProduct, setSelectedOrderProduct] = useState();
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);

  return (
    <div className="orders-container">
      <OrderCreator
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={setSelectedSupplier}
        selectedOrderProduct={selectedOrderProduct}
        setSelectedOrderProduct={setSelectedOrderProduct}
        setExpandedOrderIds={setExpandedOrderIds}
        action={"Create"}
      />
      <OrdersListBySupplier
        selectedSupplier={selectedSupplier}
        setSelectedOrderProduct={setSelectedOrderProduct}
        expandedOrderIds={expandedOrderIds}
        setExpandedOrderIds={setExpandedOrderIds}
      />
    </div>
  );
};

export default OrderCreate;
