import { Order } from "../models/order";

export const calculateOrderItems = (order: Order): number => {
    let items = 0;
    order.orderProducts.map((op) => 
    items += op.quantity
   );
    return items;
  };