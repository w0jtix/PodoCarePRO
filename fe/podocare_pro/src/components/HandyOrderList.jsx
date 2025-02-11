import React from "react";

const HandyOrderList = ({ attributes, orders }) => {
  const attributeMap = {
    Numer: "orderNumber",
    Data: "orderDate",
    "Ilość produktów": "quantity",
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
    return (
      order.saleProductInstances.length +
      order.toolProductInstances.length +
      order.equipmentProductInstances.length
    );
  };

  const handleProductAddToOrder = (orderProduct) => {};

  return (
    <div className="handy-order-list-container">
      {orders.map((order, index) => (
        <div key={`${order.id}-${index}`} className="order-item">
          {attributes.map((attr) => (
            <div
              key={`${order.id}-${attr.name}`}
              className={`order-attribute-item ${
                attr.name === "" ? "order-category-column" : ""
              }`}
              style={{
                width: attr.width,
                justifyContent: attr.justify,
              }}
            >
              {attr.name === "" ? (
                <button
                  className="order-product-move-button"
                  onClick={() => handleProductAddToOrder(order.orderProduct)}
                >
                  <img
                    src="src/assets/arrow_down.svg"
                    alt="Expand order"
                    className="expand-order-icon"
                  />
                </button>
              ) : attr.name === "Numer" ? (
                <span>{order.orderNumber}</span>
              ) : attr.name === "Data" ? (
                <span>{formatDate(order.orderDate)}</span>
              ) : attr.name === "Ilość produktów" ? (
                <span>{calculateOrderItems(order)}</span>
              ) : attr.name === "Wartość" ? (
                <span>{order.totalValue}</span>
              ) : (
                getNestedValue(order, attributeMap[attr.name])
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default HandyOrderList;
