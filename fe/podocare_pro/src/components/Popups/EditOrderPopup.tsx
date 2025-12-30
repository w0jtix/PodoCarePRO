import React, { useEffect, useCallback } from "react";
import { useState } from "react";
import ReactDOM from "react-dom";
import OrderCreator from "../Orders/OrderCreator";
import { Order } from "../../models/order";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import OrderService from "../../services/OrderService";

export interface EditOrderPopupProps {
  onClose: () => void;
  onSuccess: () => void;
  orderId: number | string;
  className?: string;
}

export function EditOrderPopup({
  onClose,
  onSuccess,
  orderId,
  className = "",
}: EditOrderPopupProps) {
  const [fetchedOrder, setFetchedOrder] = useState<Order | null>(null);
  const { showAlert } = useAlert();
  const [conflictProducts, setConflictProducts] = useState<Set<string>>(new Set());

  const fetchOrderById = async (orderId: number | string) => {
    OrderService.getOrderById(orderId)
      .then((data) => {
        setFetchedOrder(data);
      })
      .catch((error) => {
        console.error("Error fetching order: ", error);
        showAlert("Błąd", AlertType.ERROR);
      })
  }

  const handleConflictDetected = useCallback((productName: string, add: boolean) => {
    setConflictProducts(prev => {
      const newSet = new Set(prev);
      if (add) {
        newSet.add(productName);
      } else {
        newSet.delete(productName);
      }
      return newSet;
    });
  }, []);


  useEffect(() => {
    fetchOrderById(orderId);
  },[orderId])

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }
  if(!fetchedOrder) {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay flex justify-center align-items-start edit-order ${className}`}
      onClick={onClose}
    >
      <div
        className="edit-order-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="edit-product-popup-header">
          <h2 className="popup-title">{`Edytuj Zamówienie #${fetchedOrder?.orderNumber}`}</h2>
          <button className="popup-close-button  transparent border-none flex align-items-center justify-center absolute pointer" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="order-popup-interior width-90 mb-1">
          <OrderCreator
            selectedOrder={fetchedOrder}
            onSuccess={onSuccess}
            onClose={onClose}
            onConflictDetected={handleConflictDetected}
          />
        </section>
        {conflictProducts.size > 0 && (
          <div className="popup-warning-explanation-display flex justify-center">
            <img
              src="src/assets/warning.svg"
              alt="Warning"
              className="order-item-warning-icon"
            />
            <a className="warning-explanation text-align-center">
              Konflikt: Usunięto więcej produktów niż jest w magazynie dla:
              <br />
              <strong>{Array.from(conflictProducts).join(', ')}</strong>
              <br />
              Po zatwierdzeniu stan magazynowy będzie wynosił 0.
            </a>
          </div>
        )}
       
      </div>
    </div>,
    portalRoot
  );
}

export default EditOrderPopup;
