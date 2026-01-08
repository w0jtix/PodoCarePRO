import React from "react";
import { useState, useCallback } from "react";
import ActionButton from "../ActionButton";
import OrderContent from "./OrderContent";
import EditOrderPopup from "../Popups/EditOrderPopup";
import RemoveOrderPopup from "../Popups/RemoveOrderPopup";
import { ListAttribute } from "../../constants/list-headers";
import { Order } from "../../models/order";
import { Action } from "../../models/action";
import { calculateOrderItems } from "../../utils/orderUtils";
import { formatDate } from "../../utils/dateUtils";

export interface OrderListProps {
  attributes: ListAttribute[];
  orders: Order[];
  onSuccess: () => void;
  className?: string;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

export function OrderList({
  attributes,
  orders,
  onSuccess,
  className = "",
  onScroll,
  isLoading = false,
  hasMore = true,
}: OrderListProps) {
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editOrderId, setEditOrderId] =
    useState<number | string | null>(null);
  const [removeOrderId, setRemoveOrderId] =
    useState<number | string | null>(null);

  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, order: Order) => {
      e.stopPropagation();
      setEditOrderId(order.id);
    },
    [setEditOrderId]
  );

  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, order: Order) => {
      e.stopPropagation();
      setRemoveOrderId(order.id);
    },
    [setRemoveOrderId]
  );

  const toggleOrders = (orderId: number) => {
    setExpandedOrderIds((prevIds) =>
      prevIds.includes(orderId)
        ? prevIds.filter((id) => id !== orderId)
        : [...prevIds, orderId]
    );
  };

  const renderAttributeContent = (
    attr: ListAttribute,
    order: Order
  ): React.ReactNode => {
    switch (attr.name) {
      case "":
        return (
          <img
            src="src/assets/arrow_down.svg"
            alt="arrow down"
            className={`arrow-down ${
              expandedOrderIds.includes(order.id) ? "rotated" : ""
            }`}
          />
        );

      case "Numer":
        return `# ${order.orderNumber}`;

      case "Sklep":
        return `${order.supplier.name}`

      case "Data Zamówienia":
        return formatDate(order.orderDate);

      case "Produkty":
        return `${calculateOrderItems(order)}`

      case "Netto":
        return (
          <span className="order-values-lower-font-size">
            {order.totalNet.toFixed(2)}
          </span>
        );

      case "VAT":
        return (
          <span className="order-values-lower-font-size">
            {order.totalVat.toFixed(2)}
          </span>
        );

      case "Brutto":
        return (
          <span className="order-values-lower-font-size">
            {order.totalValue.toFixed(2)}
          </span>
        );

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons flex">
            <ActionButton
              src={"src/assets/edit.svg"}
              alt={"Edytuj Produkt"}
              iconTitle={"Edytuj Produkt"}
              text={"Edytuj"}
              onClick={(e) => handleOnClickEdit(e, order)}
              disableText={true}
            />
            <ActionButton
              src={"src/assets/cancel.svg"}
              alt={"Usuń Produkt"}
              iconTitle={"Usuń Produkt"}
              text={"Usuń"}
              onClick={(e) => handleOnClickRemove(e, order)}
              disableText={true}
            />
          </div>
        );

      default:
        return <span>{"-"}</span>;
    }
  };

  return (
    <div 
      className={`item-list order width-93 grid p-0 mt-05 ${orders.length === 0 ? "border-none" : ""} ${className}`}
      onScroll={onScroll}
      >
      {orders.map((order) => (
        <div key={order.id} className={`product-wrapper order ${className}`}>
          <div
            className={`item order align-items-center flex-column ${
              order.orderProducts.length > 0 ? "pointer" : ""
            } ${className}`}
            onClick={() => toggleOrders(order.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && order.orderProducts.length > 0) {
                toggleOrders(order.id);
              }
            }}
          >
            <div className="height-max width-max justify-center align-items-center flex">
            {attributes.map((attr) => (
              <div
                key={`${order.id}-${attr.name}`}
                className={`attribute-item flex ${
                  attr.name === "" ? "category-column" : ""
                } ${className}`}
                style={{
                  width: attr.width,
                  justifyContent: attr.justify,
                }}
              >
                {renderAttributeContent(attr, order)}
              </div>
            ))}
            </div>
            {expandedOrderIds.includes(order.id) && (
            <OrderContent order={order} action={Action.HISTORY} />
          )}
          </div>
          
        </div>
      ))}
      {editOrderId != null && (
        <EditOrderPopup
          onClose={() => setEditOrderId(null)}
          onSuccess={onSuccess}
          orderId={editOrderId}
        />
      )}
      {removeOrderId != null && (
        <RemoveOrderPopup
          onClose={() => setRemoveOrderId(null)}
          onSuccess={onSuccess}
          orderId={removeOrderId}
        />
      )}
      {isLoading && (
        <span className="qv-span text-align-center">Ładowanie...</span>
      )}
    </div>
  );
}

export default OrderList;
