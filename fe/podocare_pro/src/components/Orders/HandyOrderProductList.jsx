import React from "react";
import { useState, useEffect } from "react";
import SupplyManagerService from "../../service/SupplyManagerService";

const HandyOrderProductList = ({
  attributes,
  order,
  setSelectedOrderProduct,
  action,
  mode,
  setHasWarning,
}) => {
  const [warningVisible, setWarningVisible] = useState({});

  const fetchManagers = async (filterDTO) => {
    return SupplyManagerService.getManagers(filterDTO)
      .then((data) => {
        order.orderProductDTOList.forEach((orderProduct) => {
          const productId = orderProduct.productId;
          const supplyData = data.find((d) => d.productId === productId);
          const activeCount = supplyData ? supplyData.supply : 0;
          const opQuantity = orderProduct.quantity;
          const shouldWarn = opQuantity > 0 && opQuantity > activeCount;
          setWarningVisible((prevVisibility) => ({
            ...prevVisibility,
            [orderProduct.id]: shouldWarn,
          }));
          if (shouldWarn) {
            setHasWarning(true);
          }
        });
      })
      .catch((error) => {
        console.error("Error fetching supply managers:", error);
      });
  };

/*   const fetchSupply = async () => {
    const productIdsToCheckSupplyFor = order.orderProductDTOList
      .map((item) => item.productId)
      .filter((id) => id != null);

    const filterDTO = { productIds: [...new Set(productIdsToCheckSupplyFor)] };
    return SupplyManagerService.getManagers(filterDTO)
      .then((data) => {
        const supplyMap = {};
        const deletedStatusMap = {};

        data.forEach((manager) => {
          supplyMap[manager.productId] = manager.supply;
          deletedStatusMap[manager.productId] = manager.isDeleted;
        });

        setAvailableSupply(supplyMap);
        setSoftDeletedProducts(deletedStatusMap);
      })
      .catch((error) => {
        console.error("Error fetching supply managers:", error);
      });
  }; */

  useEffect(() => {
    if (action === "History" && mode === "Popup") {
      const productIds = order.orderProductDTOList.map(
        (orderProduct) => orderProduct.productId
      );
      if (productIds.length > 0) {
        const filterDTO = { productIds: productIds };
        fetchManagers(filterDTO);
      }
    }
  }, [order]);

  const calculateNetPrice = (total, vatRate) => {
    if (typeof vatRate === "string") {
      vatRate = 0;
    }
    const result = total / (1 + vatRate / 100);
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
            key={`${orderProduct.id}-${index}`}
            className="handy-order-product-item"
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
                  action === "History" ? (
                    <div
                      className={`category-container ${
                        mode ? mode.toLowerCase() : ""
                      }`}
                      style={{
                        backgroundColor: `rgb(${orderProduct.productCategoryColor})`,
                      }}
                    ></div>
                  ) : action === "Create" ? (
                    <button
                      className="order-product-move-button"
                      onClick={() => setSelectedOrderProduct(orderProduct)}
                      style={{
                        border: `1px solid rgb(${orderProduct.productCategoryColor})`,
                        borderRadius: "50%",
                      }}
                    >
                      <div
                        className="order-product-move-icon"
                        style={{
                          backgroundColor: `rgb(${orderProduct.productCategoryColor})`,
                        }}
                      ></div>
                    </button>
                  ) : null
                ) : attr.name === "Nazwa" ? (
                  <div className="handy-order-product-list-product-name-display">
                    <span
                      className={`order-product-list-span ${
                        warningVisible[orderProduct.id] === true &&
                        action === "History" &&
                        mode === "Popup"
                          ? "warning-visible"
                          : ""
                      }`}
                    >
                      {orderProduct.productName}
                    </span>
                    {warningVisible[orderProduct.id] === true &&
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
                      warningVisible[orderProduct.id] === true &&
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
                      warningVisible[orderProduct.id] === true &&
                      action === "History" &&
                      mode === "Popup"
                        ? "warning-visible"
                        : ""
                    }`}
                  >
                    {calculateNetPrice(
                      orderProduct.price,
                      orderProduct.vatRate
                    )}
                  </span>
                ) : attr.name === "VAT" ? (
                  <span
                    className={`order-product-list-span ${
                      warningVisible[orderProduct.id] === true &&
                      action === "History" &&
                      mode === "Popup"
                        ? "warning-visible"
                        : ""
                    }`}
                  >{`${orderProduct.vatRate}${
                    typeof orderProduct.vatRate === "string" ? "" : "%"
                  }`}</span>
                ) : attr.name === "Cena [szt]" ? (
                  <span
                    className={`order-product-list-span ${
                      warningVisible[orderProduct.id] === true &&
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
              className={`attribute-item order${
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
