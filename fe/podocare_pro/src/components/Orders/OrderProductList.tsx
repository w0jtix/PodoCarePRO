import React, { useEffect } from "react";
import ListHeader from "../ListHeader";
import OrderItemList from "./OrderItemList";
import { useCallback } from "react";
import { ListModule } from "../ListHeader";
import { ORDER_ITEM_LIST_ATTRIBUTES } from "../../constants/list-headers";
import { NewOrderProduct, OrderProduct } from "../../models/order-product";
import { Action } from "../../models/action";
import { OrderProductWorkingData } from "../../models/working-data";

export interface OrderProductListProps {
  orderProducts: OrderProductWorkingData[];
  onOrderProductsChange: (orderProducts: OrderProductWorkingData[]) => void;
  action: Action;
  setHasWarning?: (hasWarning: boolean) => void;
  className?: string;
}

export function OrderProductList ({
  orderProducts,
  onOrderProductsChange,
  action,
  setHasWarning,
  className="",
}: OrderProductListProps) {

  return (
    <div className={`order-productList ${className}`}>
      <ListHeader attributes={ORDER_ITEM_LIST_ATTRIBUTES} module={ListModule.ORDER} />
      <OrderItemList
        attributes={ORDER_ITEM_LIST_ATTRIBUTES}
        orderProducts={orderProducts}
        onOrderProductsChange={onOrderProductsChange}
        action={action}
        setHasWarning={setHasWarning}
      />
    </div>
  );
};

export default OrderProductList;
