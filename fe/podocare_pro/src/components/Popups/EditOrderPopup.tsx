import React, { useEffect } from "react";
import { useState } from "react";
import ReactDOM from "react-dom";
import OrderCreator from "../Orders/OrderCreator";
import { Order } from "../../models/order";

export interface EditOrderPopupProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  selectedOrder: Order;
  className?: string;
}

export function EditOrderPopup({
  onClose,
  onSuccess,
  selectedOrder,
  className = "",
}: EditOrderPopupProps) {
  const [hasWarning, setHasWarning] = useState<boolean>(false);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay edit-order ${className}`}
      onClick={onClose}
    >
      <div
        className="edit-order-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="edit-product-popup-header">
          <h2 className="popup-title">{`Edytuj Zamówienie #${selectedOrder.orderNumber}`}</h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="order-popup-interior">
          <OrderCreator
            selectedOrder={selectedOrder}
            hasWarning={hasWarning}
            setHasWarning={setHasWarning}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </section>
        {hasWarning && (
          <div className="popup-warning-explanation-display">
            <img
              src="src/assets/warning.svg"
              alt="Warning"
              className="order-item-warning-icon"
            />
            <a className="warning-explanation">
              Konflikt: Chcesz usunąć więcej Produktów niż masz w Magazynie!
              <br />
              Po zatwierdzeniu usuniesz dostępne Produkty.
            </a>
          </div>
        )}
      </div>
    </div>,
    portalRoot
  );
}

export default EditOrderPopup;
