import React from "react";

const HandyOrderProductList = ({
  attributes,
  order,
  setSelectedOrderProduct,
  action,
}) => {
/*   const getOrderProductCategoryAndDetails = (orderProduct) => {
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
  }; */

  const categoryColors = {
    Sale: "green",
    Tool: "yellow",
    Equipment: "pink",
  };

  const getArrowSrc = (category) => {
    return `src/assets/${categoryColors[category]}Arrow.svg`;
  };

  const calculateNetPrice = (total, vatrate) => {
    const result = total / (1 + vatrate / 100);
    return result.toFixed(2);
  };

  return (
    <div className="handy-order-product-list-container">
      {order.orderProductDTOList.map((orderProduct, index) => {
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
                  action === "History" ? (
                    <div
                      className={`category-container ${categoryColors[orderProduct.category]}`}
                      /* style={{
                      backgroundColor: categoryColors[category],
                    }} */
                    ></div>
                  ) : action === "Create" ? (
                    <button
                      className="order-product-move-button"
                      onClick={() => setSelectedOrderProduct(orderProduct)}
                    >
                      <img
                        src={getArrowSrc(orderProduct.category)}
                        alt="Move orderProduct"
                        className="move-order-product-icon"
                      />
                    </button>
                  ) : null
                ) : attr.name === "Nazwa" ? (
                  <span>{orderProduct.productName}</span>
                ) : attr.name === "Ilość" ? (
                  <span>{orderProduct.quantity}</span>
                ) : attr.name === "Netto [szt]" ? (
                  <span>
                    {calculateNetPrice(
                      orderProduct.price,
                      orderProduct.VATrate
                    )}
                  </span>
                ) : attr.name === "VAT" ? (
                  <span>{`${orderProduct.VATrate}%`}</span>
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
      {action === "History" && order.shippingCost > 0 && (
        <div className="handy-order-product-item shipping-cost-row">
          {attributes.map((attr) => (
            <div
              key={`shipping-${attr.name}`}
              className={`order-attribute-item ${
                attr.name === "" ? "order-category-column" : ""
              }`}
              style={{
                width: attr.width,
                justifyContent: attr.justify,
              }}
            >
              {attr.name ==="" ? (
                <img src="src/assets/shipping.svg" alt="Shipping" className="order-history-order-details-shipping-icon">
                </img>
              ) : attr.name === "Nazwa" ? (
                <span>Koszt wysyłki</span>
              ) : attr.name === "Netto [szt]" ? (
                <span>{calculateNetPrice(
                  order.shippingCost,
                  order.shippingVatRate
                )}</span>
              ) : attr.name === "VAT" ? (
                <span>{`${order.shippingVatRate}%`}</span>
              ) : attr.name === "Cena [szt]" ? (
                <span>{order.shippingCost.toFixed(2)}</span>
              ) : (
                ""
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HandyOrderProductList;
