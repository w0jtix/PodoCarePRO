import React, { useEffect } from "react";
import ListHeader from "../ListHeader";
import OrderItemList from "./OrderItemList";
import { useCallback } from "react";
import { ListModule } from "../ListHeader";
import { ORDER_ITEM_LIST_ATTRIBUTES } from "../../constants/list-headers";
import { NewOrderProduct } from "../../models/order-product";
import { Action } from "../../models/action";

export interface OrderProductListProps {
  action: Action;
  onConflictDetected?: (productName: string, add: boolean) => void;
  className?: string;


  orderProducts: NewOrderProduct[];
  setOrderProducts: React.Dispatch<React.SetStateAction<NewOrderProduct[]>>;
}

export function OrderProductList ({
  action,
  onConflictDetected,
  className="",
  orderProducts,
  setOrderProducts,
}: OrderProductListProps) {

  return (
    <div className={`order-product-list flex-column g-5px ${className}`}>
      <ListHeader attributes={ORDER_ITEM_LIST_ATTRIBUTES} module={ListModule.ORDER} />
      <OrderItemList
        attributes={ORDER_ITEM_LIST_ATTRIBUTES}
        action={action}
        onConflictDetected={onConflictDetected}
        orderProducts={orderProducts}
        setOrderProducts={setOrderProducts}
      />
    </div>
  );
};

export default OrderProductList;
