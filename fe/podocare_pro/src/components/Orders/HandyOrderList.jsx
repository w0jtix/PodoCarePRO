import React from "react";
import { useState } from "react";
import OrderContent from "./OrderContent";

const HandyOrderList = ({
  attributes,
  orders,
  setSelectedOrderProduct,
  expandedOrderIds,
  setExpandedOrderIds,
}) => {
  const attributeMap = {
    Numer: "orderNumber",
    Data: "orderDate",
    Produkty: "quantity",
    Wartość: "totalValue",
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const calculateOrderItems = (order) => {
    return order.orderProductDTOList.length;
  };

  const toggleOrderProducts = (orderId) => {
    setExpandedOrderIds((prevIds) =>
      prevIds.includes(orderId)
        ? prevIds.filter((id) => id !== orderId)
        : [...prevIds, orderId]
    );
  };

  return (
    <div className="handy-order-list-container">
      {[...orders]
        .sort((a, b) => b.orderNumber - a.orderNumber)
        .map((order, index) => (
          <div key={`${order.id}-${index}`} className="order-wrapper">
            <div
              className="handy-order-item"
              onClick={() => toggleOrderProducts(order.id)}
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
                  {attr.name === "" ? (
                    <button className="order-product-move-button">
                      <img
                        src="src/assets/arrow_down.svg"
                        alt="Expand order"
                        className={`expand-order-icon ${
                          expandedOrderIds.includes(order.id)
                            ? "rotated"
                            : ""
                        }`}
                      />
                    </button>
                  ) : attr.name === "Numer" ? (
                    <span>{order.orderNumber}</span>
                  ) : attr.name === "Data" ? (
                    <span>{formatDate(order.orderDate)}</span>
                  ) : attr.name === "Produkty" ? (
                    <span>{calculateOrderItems(order)}</span>
                  ) : attr.name === "Wartość" ? (
                    <span>
                      {order.totalValue !== null
                        ? order.totalValue.toFixed(2)
                        : order.totalValue}
                    </span>
                  ) : (
                    getNestedValue(order, attributeMap[attr.name])
                  )}
                </div>
              ))}
            </div>
            {expandedOrderIds.includes(order.id) && (
              <OrderContent
                order={order}
                setSelectedOrderProduct={setSelectedOrderProduct}
                action={"Create"}
              />
            )}
          </div>
        ))}
    </div>
  );
};

export default HandyOrderList;
