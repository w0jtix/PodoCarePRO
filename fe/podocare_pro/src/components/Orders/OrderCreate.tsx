import { useCallback } from "react";
import OrderCreator from "./OrderCreator";
import OrdersListBySupplier from "./OrdersListBySupplier";
import { useState } from "react";
import { Supplier } from "../../models/supplier";
import { OrderProduct } from "../../models/order-product";

export function OrderCreate () {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null); 
  const [selectedOrderProduct, setSelectedOrderProduct] = useState<OrderProduct | null>();
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);

  const handleReset = useCallback(() => {
    setSelectedSupplier(null);
    setSelectedOrderProduct(null);
    setExpandedOrderIds([]);
  },[]);

  return (
    <div className="orders-container mt-4 width-max height-fit-content flex space-around relative">
      <OrderCreator
        setSelectedSupplier={setSelectedSupplier}
        selectedOrderProduct={selectedOrderProduct}
        setExpandedOrderIds={setExpandedOrderIds}
        onReset={handleReset}
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
