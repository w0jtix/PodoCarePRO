import React from "react";

const OrderListHeader = ({ attributes }) => {
  return (
    <div className="order-list-header">
      {attributes.map((attr, index) => (
        <h2
          key={index}
          className="order-attribute-item"
          style={{
            width: attr.width,
            justifyContent: attr.justify,
            fontSize: attr.size,
          }}
        >
          {attr.name}
        </h2>
      ))}
    </div>
  );
};

export default OrderListHeader;
