import React from "react";
import { useState, useEffect, useCallback } from "react";
import { ListAttribute } from "../../constants/list-headers";
import { Order } from "../../models/order";
import { OrderProduct } from "../../models/order-product";
import { Action, Mode } from "../../models/action";
import AllProductService from "../../services/AllProductService";
import { ProductFilterDTO } from "../../models/product";
import { getVatRateDisplay } from "../../models/vatrate";
import { calculateNetPrice } from "../../utils/priceUtils";

export interface HandyOrderProductListProps {
  attributes: ListAttribute[];
  order: Order;
  setSelectedOrderProduct?: (orderProduct: OrderProduct | null) => void;
  action: Action;
  mode?: Mode;
  setHasWarning?: (hasWarning: boolean) => void;
  className?: string;
}

export function HandyOrderProductList({
  attributes,
  order,
  setSelectedOrderProduct,
  action,
  mode = Mode.NORMAL,
  setHasWarning,
  className = "",
}: HandyOrderProductListProps) {
  const [warningVisible, setWarningVisible] = useState<Record<number, boolean>>(
    {}
  );

  const handleProductSelect = useCallback(
    (orderProduct: OrderProduct | null) => {
      if (setSelectedOrderProduct) {
        setSelectedOrderProduct(orderProduct);
      }
    },
    [setSelectedOrderProduct]
  );

  const fetchProductSupply = useCallback(
    async (filter: ProductFilterDTO) => {
      return AllProductService.getProducts(filter)
        .then((data) => {
          order.orderProducts.forEach((orderProduct) => {
            const productId = orderProduct.product?.id;
            const supplyData = data.find((d) => d.id === productId);
            const activeCount = supplyData ? supplyData.supply : 0;
            const opQuantity = orderProduct.quantity;
            const shouldWarn = opQuantity > 0 && opQuantity > activeCount;
            setWarningVisible((prevVisibility) => ({
              ...prevVisibility,
              [orderProduct.id]: shouldWarn,
            }));
            if (shouldWarn) {
              setHasWarning?.(true);
            }
          });
        })
        .catch((error) => {
          console.error("Error fetching product supply:", error);
        });
    },
    [order.orderProducts, setHasWarning]
  );

  useEffect(() => {
    if (action === Action.HISTORY && mode === Mode.POPUP) {
      const productIds = Array.from(
        new Set(
          order.orderProducts
            .map((orderProduct) => orderProduct.product?.id)
            .filter((id): id is number => id != null)
        )
      );
      if (productIds.length > 0) {
        const filter: ProductFilterDTO = {
          productIds: productIds.length === 0 ? null : productIds,
        };
        fetchProductSupply(filter);
      }
    }
  }, [action, mode, fetchProductSupply]);

  const getCategoryColor = (orderProduct: OrderProduct): string | undefined => {
    const color = orderProduct.product?.category?.color;
    return color ? `rgb(${color})` : undefined;
  };

  const hasWarning = (id: number) =>
    warningVisible[id] && action === Action.HISTORY && mode === Mode.POPUP;

  const renderAttributeContent = (
    attr: ListAttribute,
    orderProduct: OrderProduct,
    index: number
  ): React.ReactNode => {
    const warning = hasWarning(orderProduct.id);
    const warningClass = warning ? "warning-visible" : "";
    switch (attr.name) {
      case "":
        if (action === Action.HISTORY) {
          return (
            <div
              className={`category-container width-40 p-0 ${mode.toString().toLowerCase()}`}
              style={{ backgroundColor: getCategoryColor(orderProduct) }}
            />
          );
        } else if (action === Action.CREATE) {
          const color = getCategoryColor(orderProduct);
          return (
            <button
              className="order-product-move-button border-none pointer transparent p-0"
              onClick={() => handleProductSelect(orderProduct)}
              style={{
                ...(color && {
                  border: `1px solid ${color}`,
                  borderRadius: "50%",
                }),
              }}
            >
              <div
                className="order-product-move-icon p-0 width-half justify-self-center height-40"
                style={{ backgroundColor: color }}
              />
            </button>
          );
        }
        return null;

      case "Nazwa":
        return (
          <div className="width-max flex space-between">
            <span className={`order-product-list-span ${warningClass}`}>
              {orderProduct.product?.name}
            </span>
            {warning && (
              <img
                src="src/assets/warning.svg"
                alt="Warning"
                className="order-item-warning-icon"
              />
            )}
          </div>
        );

      case "Ilość":
        return (
          <span className={`order-product-list-span ${warningClass}`}>
            {orderProduct.quantity}
          </span>
        );

      case "Netto [szt]":
        return (
          <span className={`order-product-list-span ${warningClass}`}>
            {calculateNetPrice(orderProduct.price, orderProduct.vatRate)}
          </span>
        );

      case "VAT":
        return (
          <span className={`order-product-list-span ${warningClass}`}>
            {getVatRateDisplay(orderProduct.vatRate)}
          </span>
        );

      case "Cena [szt]":
        return (
          <span className={`order-product-list-span ${warningClass}`}>
            {orderProduct.price.toFixed(2)}
          </span>
        );

      default:
        return "N/A";
    }
  };

  const renderShippingAttributeContent = (
    attr: ListAttribute
  ): React.ReactNode => {
    switch (attr.name) {
      case "":
        return (
          <img
            src="src/assets/shipping.svg"
            alt="Shipping"
            className="order-history-order-details-shipping-icon"
          />
        );
      case "Nazwa":
        return "Koszt wysyłki";
      case "Netto [szt]":
        return calculateNetPrice(order.shippingCost, order.shippingVatRate);
      case "VAT":
        return `${getVatRateDisplay(order.shippingVatRate)}`;
      case "Cena [szt]":
        return order.shippingCost.toFixed(2);
      default:
        return "";
    }
  };

  const shouldShowShipping = (): boolean => {
    return (
      action === Action.HISTORY &&
      order.shippingCost != null &&
      order.shippingCost > 0
    );
  };

  return (
    <div
      className={`handy-order-product-list-container flex-column ${
        mode === "Popup" ? "popup" : ""
      } ${className}`}
    >
      {order.orderProducts.map((orderProduct, index) => {
        return (
          <div
            key={`${orderProduct.id}-${index}`}
            className="handy-order-product-item flex"
          >
            {attributes.map((attr) => (
              <div
                key={`${order.id}-${attr.name}`}
                className={`attribute-item flex order ${
                  attr.name === "" ? "order-category-column" : ""
                }`}
                style={{
                  width: attr.width,
                  justifyContent: attr.justify,
                }}
              >
                {renderAttributeContent(attr, orderProduct, index)}
              </div>
            ))}
          </div>
        );
      })}
      {shouldShowShipping() && (
        <div className="handy-order-product-item flex shipping-cost-row">
          {attributes.map((attr) => (
            <div
              key={`shipping-${attr.name}`}
              className={`attribute-item flex order${
                attr.name === "" ? "order-category-column" : ""
              }`}
              style={{
                width: attr.width,
                justifyContent: attr.justify,
              }}
            >
              {renderShippingAttributeContent(attr)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HandyOrderProductList;
