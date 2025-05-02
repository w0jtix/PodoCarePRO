import React from "react";

const OrderProductListHeader = ({ attributes }) => {
  return (
    <div className="order-product-list-header">
      {attributes.map((attr, index) => (
        <h2
          key={index}
          className="order-product-attribute-item"
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

export default OrderProductListHeader;
