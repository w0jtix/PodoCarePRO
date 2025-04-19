import React from "react";
import OrderProductListHeader from "./OrderProductListHeader";
import HandyProductInstanceList from "./HandyProductInstanceList";

const ProductContent = ({ product }) => {
  let attributes = [
    { name: "", width: "5%", justify: "center" },
    { name: "Nazwa", width: "35%", justify: "start" },
    { name: "Data ważności", width: "20%", justify: "center" },
    { name: "Data zakupu", width: "20%", justify: "center" },
    { name: "Cena sprzedaży", width: "20%", justify: "center" },
  ];

  attributes = attributes.map((attr) => {
    if (attr.name === "Data ważności" && product.category === "Tool") {
      return { ...attr, name: "" };
    }
    return attr;
  });

  if (product.category === "Equipment" || product.category === "Tool") {
    attributes = attributes.filter((attr) => attr.name !== "Cena sprzedaży");
  }

  return (
    <div className="product-content">
      {product.productInstances.length > 0 && (
        <>
          <OrderProductListHeader attributes={attributes} />
          <HandyProductInstanceList attributes={attributes} product={product} />
        </>
      )}
    </div>
  );
};

export default ProductContent;
