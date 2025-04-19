import React from "react";
import { useState, useEffect } from "react";
import AllProductService from "../service/AllProductService";

const HandyOrderProductList = ({
  attributes,
  order,
  setSelectedOrderProduct,
  action,
  mode,
  setHasWarning,
}) => {
  const [warningVisible, setWarningVisible] = useState({});
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

  useEffect(() => {
    if (action === "History" && mode === "Popup") {
      order.orderProductDTOList.map((orderProduct) => {
        const productId = orderProduct.productId;
        if (productId) {
          return AllProductService.findProductByIdAndIncludeActiveInstances(
            productId
          )
            .then((data) => {
              const activeCount = data.activeProductInstances.length;
              const qtyDifference = orderProduct.quantity;
              const shouldWarn =
                qtyDifference > 0 && qtyDifference > activeCount;
              setWarningVisible((prevVisibility) => ({
                ...prevVisibility,
                [orderProduct.orderProductId]: shouldWarn,
              }));

              if (shouldWarn) {
                setHasWarning(true);
              }
            })
            .catch((error) => {
              console.error("Error checking supply count:", error);
            });
        }
      });
    }
  }, [order]);

  const getArrowSrc = (category) => {
    return `src/assets/${categoryColors[category]}Arrow.svg`;
  };

  const calculateNetPrice = (total, vatrate) => {
    const result = total / (1 + vatrate / 100);
    return result.toFixed(2);
  };

  return (
    <div
      className={`handy-order-product-list-container ${
        mode === "Popup" ? "popup" : ""
      }`}
    >
      {order.orderProductDTOList.map((orderProduct, index) => {
        return (
          <div
            key={`${orderProduct.orderProductId}-${index}`}
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
                      className={`category-container ${
                        categoryColors[orderProduct.category]
                      }`}
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
                  <div className="handy-order-product-list-product-name-display">
                    <span
                      className={`order-product-list-span ${
                        warningVisible[orderProduct.orderProductId] === true &&
                        action === "History" &&
                        mode === "Popup"
                          ? "warning-visible"
                          : ""
                      }`}
                    >
                      {orderProduct.productName}
                    </span>
                    {warningVisible[orderProduct.orderProductId] === true &&
                      action === "History" &&
                      mode === "Popup" && (
                        <img
                          src="src/assets/warning.svg"
                          alt="Warning"
                          className="order-item-warning-icon"
                        />
                      )}
                  </div>
                ) : attr.name === "Ilość" ? (
                  <span
                    className={`order-product-list-span ${
                      warningVisible[orderProduct.orderProductId] === true &&
                      action === "History" &&
                      mode === "Popup"
                        ? "warning-visible"
                        : ""
                    }`}
                  >
                    {orderProduct.quantity}
                  </span>
                ) : attr.name === "Netto [szt]" ? (
                  <span
                    className={`order-product-list-span ${
                      warningVisible[orderProduct.orderProductId] === true &&
                      action === "History" &&
                      mode === "Popup"
                        ? "warning-visible"
                        : ""
                    }`}
                  >
                    {calculateNetPrice(
                      orderProduct.price,
                      orderProduct.VATrate
                    )}
                  </span>
                ) : attr.name === "VAT" ? (
                  <span
                    className={`order-product-list-span ${
                      warningVisible[orderProduct.orderProductId] === true &&
                      action === "History" &&
                      mode === "Popup"
                        ? "warning-visible"
                        : ""
                    }`}
                  >{`${orderProduct.VATrate}%`}</span>
                ) : attr.name === "Cena [szt]" ? (
                  <span
                    className={`order-product-list-span ${
                      warningVisible[orderProduct.orderProductId] === true &&
                      action === "History" &&
                      mode === "Popup"
                        ? "warning-visible"
                        : ""
                    }`}
                  >
                    {orderProduct.price.toFixed(2)}
                  </span>
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
              {attr.name === "" ? (
                <img
                  src="src/assets/shipping.svg"
                  alt="Shipping"
                  className="order-history-order-details-shipping-icon"
                ></img>
              ) : attr.name === "Nazwa" ? (
                <span>Koszt wysyłki</span>
              ) : attr.name === "Netto [szt]" ? (
                <span>
                  {calculateNetPrice(order.shippingCost, order.shippingVatRate)}
                </span>
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
