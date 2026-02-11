import React from "react";
import OrderContent from "./OrderContent";
import { ListAttribute } from "../../constants/list-headers";
import { Order } from "../../models/order";
import { OrderProduct } from "../../models/order-product";
import { Action } from "../../models/action";
import { formatDate } from "../../utils/dateUtils";
import { formatPrice } from "../../utils/priceUtils";
import { calculateOrderItems } from "../../utils/orderUtils";

export interface HandyOrderListProps {
  attributes: ListAttribute[];
  orders: Order[];
  setSelectedOrderProduct: (orderProduct: OrderProduct | null) => void;
  expandedOrderIds: number[];
  setExpandedOrderIds: React.Dispatch<React.SetStateAction<number[]>>;
  className?: string;
}

export function HandyOrderList({
  attributes,
  orders,
  setSelectedOrderProduct,
  expandedOrderIds,
  setExpandedOrderIds,
  className = "",
}: HandyOrderListProps) {
  const toggleOrder = (orderId: number) => {
    setExpandedOrderIds((prevIds) =>
      prevIds.includes(orderId)
        ? prevIds.filter((id) => id !== orderId)
        : [...prevIds, orderId]
    );
  };

  const renderAttributeContent = (
    attr: ListAttribute,
    order: Order
  ): React.ReactNode => {
    if (attr.name === "") {
      return (
        <button className="order-product-move-button border-none pointer transparent p-0">
          <img
            src="src/assets/arrow_down.svg"
            alt="Expand order"
            className={`expand-order-icon grid pointer ${
              expandedOrderIds.includes(order.id) ? "rotated" : ""
            }`}
          />
        </button>
      );
    }

    switch (attr.name) {
      case "Numer":
        return <span className="order-number">#{order.orderNumber}</span>;

      case "Data":
        return <span className="order-date">{formatDate(order.orderDate)}</span>;

      case "Produkty":
        return <span className="order-products-count">{calculateOrderItems(order)}</span>;

      case "Wartość":
        return <span className="order-value">{formatPrice(order.totalValue)}</span>;

      default:
        return <span>{"-"}</span>;
    }
  };

  return (
    <div className={`handy-order-list-container flex-column ${className}`}>
      {[...orders]
        .sort((a, b) => b.orderNumber - a.orderNumber)
        .map((order, index) => (
          <div key={`${order.id}-${index}`} className="order-wrapper">
            <div
              className="handy-order-item flex pointer"
              onClick={() => toggleOrder(order.id)}
            >
              {attributes.map((attr) => (
                <div
                  key={`${order.id}-${attr.name}`}
                  className={`attribute-item flex order ${
                    attr.name === "" ? "order-category-column" : ""
                  }`}
                  style={{
                    width: attr.width,
                    justifyContent: attr.justify,
                  }}
                >
                  {renderAttributeContent(attr, order)}
                </div>
              ))}
            </div>
            {expandedOrderIds.includes(order.id) && (
              <OrderContent
                order={order}
                setSelectedOrderProduct={setSelectedOrderProduct}
                action={Action.CREATE}
              />
            )}
          </div>
        ))}
    </div>
  );
}

export default HandyOrderList;
