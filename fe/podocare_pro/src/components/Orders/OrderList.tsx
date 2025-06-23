import React from "react";
import { useState, useCallback } from "react";
import ActionButton from "../ActionButton";
import OrderContent from "./OrderContent";
import EditOrderPopup from "../Popups/EditOrderPopup";
import RemoveOrderPopup from "../Popups/RemoveOrderPopup";
import {
  ListAttribute,
  ORDER_HISTORY_ATTRIBUTES,
} from "../../constants/list-headers";
import { Order } from "../../models/order";
import { ORDER_HISTORY_ATTRIBUTE_MAP } from "../../constants/list-headers";
import { Action } from "../../models/action";

export interface OrderListProps {
  attributes: ListAttribute[];
  orders: Order[];
  currentPage: number;
  itemsPerPage: number;
  onSuccess: (message: string) => void;
  className?: string;
}

export function OrderList({
  attributes,
  orders,
  currentPage,
  itemsPerPage,
  onSuccess,
  className = "",
}: OrderListProps) {
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditOrderPopupOpen, setIsEditOrderPopupOpen] =
    useState<boolean>(false);
  const [isRemoveOrderPopupOpen, setIsRemoveOrderPopupOpen] =
    useState<boolean>(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pl-PL");
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, order: Order) => {
      e.stopPropagation();
      setIsEditOrderPopupOpen(true);
      setSelectedOrder(order);
    },
    [setSelectedOrder, setIsEditOrderPopupOpen]
  );

  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, order: Order) => {
      e.stopPropagation();
      setSelectedOrder(order);
      setIsRemoveOrderPopupOpen(true);
    },
    [setSelectedOrder, setIsRemoveOrderPopupOpen]
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

      case "Data Zamówienia":
        return formatDate(order.orderDate);

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
          <div className="item-list-single-item-action-buttons">
            <ActionButton
              src={"src/assets/edit.svg"}
              alt={"Edytuj Produkt"}
              text={"Edytuj"}
              onClick={(e) => handleOnClickEdit(e, order)}
              disableText={true}
            />
            <ActionButton
              src={"src/assets/cancel.svg"}
              alt={"Usuń Produkt"}
              text={"Usuń"}
              onClick={(e) => handleOnClickRemove(e, order)}
              disableText={true}
            />
          </div>
        );

      default:
        const path =
          ORDER_HISTORY_ATTRIBUTE_MAP[
            attr.name as keyof typeof ORDER_HISTORY_ATTRIBUTES
          ];
        return path ? getNestedValue(order, path) : null;
    }
  };

  return (
    <div className={`item-list ${orders.length === 0 ? "is-empty" : ""}`}>
      {orders.map((order) => (
        <div key={order.id} className="product-wrapper">
          <div
            className={`item ${
              order.orderProducts.length > 0 ? "pointer" : ""
            }`}
            onClick={() => toggleOrders(order.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && order.orderProducts.length > 0) {
                toggleOrders(order.id);
              }
            }}
          >
            {attributes.map((attr) => (
              <div
                key={`${order.id}-${attr.name}`}
                className={`attribute-item ${
                  attr.name === "" ? "category-column" : ""
                }`}
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
      ))}
      {isEditOrderPopupOpen && (
        <EditOrderPopup
          onClose={() => setIsEditOrderPopupOpen(false)}
          onSuccess={onSuccess}
          selectedOrder={selectedOrder as Order}
        />
      )}
      {isRemoveOrderPopupOpen && (
        <RemoveOrderPopup
          onClose={() => setIsRemoveOrderPopupOpen(false)}
          onSuccess={onSuccess}
          selectedOrder={selectedOrder as Order}
        />
      )}
    </div>
  );
}

export default OrderList;
