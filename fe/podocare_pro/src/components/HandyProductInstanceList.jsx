import React from "react";

const HandyProductInstanceList = ({ attributes, product }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("pl-PL");
  };

  return (
    <div className="handy-order-product-list-container">
      {product.productInstances
        .sort((a, b) => a.id - b.id)
        .map((instance, index) => (
          <div
            key={`${instance.id}-${index}`}
            className="handy-product-instance-item"
          >
            {attributes.map((attr, attrIndex) => (
              <div
                key={`${product.id}-${attr.name || "empty"}-${attrIndex}`}
                className={`product-attribute-item ${
                  attr.name === "" ? "order-category-column" : ""
                }`}
                style={{
                  width: attr.width,
                  justifyContent: attr.justify,
                }}
              >
                {attr.name === "" ? (
                  ""
                ) : attr.name === "Nazwa" ? (
                  <span>{product ? product.productName : "Brak nazwy"}</span>
                ) : attr.name === "Data ważności" &&
                  product.category !== "Tool" ? (
                  <span>
                    {product.category === "Equipment"
                      ? formatDate(instance.warrantyEndDate)
                      : formatDate(instance.shelfLife)}
                  </span>
                ) : attr.name === "Data zakupu" ? (
                  <span>{formatDate(instance.purchaseDate)}</span>
                ) : attr.name === "Cena sprzedaży" ? (
                  <span>{instance.sellingPrice}</span>
                ) : null}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};

export default HandyProductInstanceList;
