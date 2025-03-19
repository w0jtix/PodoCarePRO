import React from "react";

const HandyOrderProductList = ({
  attributes,
  order,
  setSelectedOrderProduct,
}) => {
  
  const getOrderProductCategoryAndDetails = (orderProduct) => {
    if (orderProduct.saleProduct) {
      return { category: "saleProduct", product: orderProduct.saleProduct };
    } else if (orderProduct.toolProduct) {
      return { category: "toolProduct", product: orderProduct.toolProduct };
    } else if (orderProduct.equipmentProduct) {
      return {
        category: "equipmentProduct",
        product: orderProduct.equipmentProduct,
      };
    }
    return { category: "Unknown", product: null };
  };

  const categoryColors = {
    saleProduct: "green",
    toolProduct: "yellow",
    equipmentProduct: "pink",
  };

  const getArrowSrc = (category) => {
    return `src/assets/${categoryColors[category]}Arrow.svg`;
  };

  return (
    <div className="handy-order-product-list-container">
      {order.orderProducts.map((orderProduct, index) => {
        const { category, product } =
          getOrderProductCategoryAndDetails(orderProduct);
        return (
          <div
            key={`${orderProduct.id}-${index}`}
            className="handy-order-product-item"
          >
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
                    onClick={() => setSelectedOrderProduct(orderProduct)}
                  >
                    <img
                      src={getArrowSrc(category)}
                      alt="Move orderProduct"
                      className="move-order-product-icon"
                    />
                  </button>
                ) : attr.name === "Nazwa" ? (
                  <span>{product ? product.productName : "Brak nazwy"}</span>
                ) : attr.name === "Ilość" ? (
                  <span>{orderProduct.quantity}</span>
                ) : attr.name === "Cena [szt]" ? (
                  <span>{orderProduct.price.toFixed(2)}</span>
                ) : (
                  "N/A"
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default HandyOrderProductList;
