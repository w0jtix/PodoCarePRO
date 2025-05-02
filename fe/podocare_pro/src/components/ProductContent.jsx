import React from "react";
import OrderProductListHeader from "./Orders/OrderProductListHeader";

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


  return (
    <div className="product-content">
        <>
          <OrderProductListHeader attributes={attributes} />
        </>
    </div>
  );
};

export default ProductContent;
