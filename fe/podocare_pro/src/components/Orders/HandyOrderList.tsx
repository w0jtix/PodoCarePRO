import React, { useCallback } from "react";
import { useState } from "react";
import OrderContent from "./OrderContent";
import { ListAttribute } from "../../constants/list-headers";
import { Order } from "../../models/order";
import { OrderProduct } from "../../models/order-product";
import { ORDER_LIST_ATTRIBUTE_MAP } from "../../constants/list-headers";
import { Action } from "../../models/action";

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
}) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const calculateOrderItems = (order: Order): number => {
    return order.orderProducts.length;
  };

  const toggleOrder = (orderId: number) => {
    setExpandedOrderIds((prevIds) =>
      prevIds.includes(orderId)
        ? prevIds.filter((id) => id !== orderId)
        : [...prevIds, orderId]
    );
  };

  const formatPrice = (value: number | null): string => {
    return value !== null ? value.toFixed(2) : "—";
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  const renderAttributeContent = (
    attr: ListAttribute,
    order: Order
  ): React.ReactNode => {
    if (attr.name === "") {
      return (
        <button className="order-product-move-button">
          <img
            src="src/assets/arrow_down.svg"
            alt="Expand order"
            className={`expand-order-icon ${
              expandedOrderIds.includes(order.id) ? "rotated" : ""
            }`}
          />
        </button>
      );
    }

    const path =
      ORDER_LIST_ATTRIBUTE_MAP[
        attr.name as keyof typeof ORDER_LIST_ATTRIBUTE_MAP
      ];
    if (!path) return null;

    const value = getNestedValue(order, path);

    switch (attr.name) {
      case "Numer":
        return <span className="order-number">#{value}</span>;

      case "Data":
        return <span className="order-date">{formatDate(value)}</span>;

      case "Produkty":
        const count = path === "quantity" ? value : calculateOrderItems(order); //check if qty is needed in map
        return <span className="order-products-count">{count}</span>;

      case "Wartość":
        return <span className="order-value">{formatPrice(value)}</span>;

      default:
        return <span>{value}</span>;
    }
  };

  return (
    <div className={`handy-order-list-container ${className}`}>
      {[...orders]
        .sort((a, b) => b.orderNumber - a.orderNumber)
        .map((order, index) => (
          <div key={`${order.id}-${index}`} className="order-wrapper">
            <div
              className="handy-order-item"
              onClick={() => toggleOrder(order.id)}
            >
              {attributes.map((attr) => (
                <div
                  key={`${order.id}-${attr.name}`}
                  className={`attribute-item order ${
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
