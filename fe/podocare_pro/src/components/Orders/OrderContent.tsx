import React from "react";
import HandyOrderProductList from "./HandyOrderProductList";
import ListHeader, { ListModule } from "../ListHeader";
import { Order } from "../../models/order";
import { OrderProduct } from "../../models/order-product";
import { ORDER_ATTRIBUTES, ORDER_HANDY_HISTORY_ATTRIBUTES, ORDER_POPUP_HISTORY_ATTRIBUTES } from "../../constants/list-headers";
import { Action, Mode } from "../../models/action";

export interface OrderContentProps {
  order: Order;
  setSelectedOrderProduct?: (orderProduct: OrderProduct | null) => void;
  action: Action;
  mode?: Mode;
  setHasWarning?: (val: boolean) => void;
}

export function OrderContent ({
  order,
  setSelectedOrderProduct,
  action,
  mode = Mode.NORMAL,
  setHasWarning,
}: OrderContentProps) {
  const getAttributes = () => {
    if (action === Action.HISTORY) {
      return mode === Mode.POPUP 
            ? ORDER_POPUP_HISTORY_ATTRIBUTES
            : ORDER_HANDY_HISTORY_ATTRIBUTES;
    }
    return ORDER_ATTRIBUTES;
  }

  const attributes = getAttributes();
  

  return (
    <div className={`order-content width-max mt-025 mb-1 ${Action[action].toLowerCase()}`}>
      <ListHeader
        attributes={attributes}
        module={ListModule.HANDY}
      />
      <HandyOrderProductList
        attributes={attributes}
        order={order}
        setSelectedOrderProduct={setSelectedOrderProduct}
        action={action}
        mode={mode}
        setHasWarning={setHasWarning}
      />
    </div>
  );
};

export default OrderContent;
