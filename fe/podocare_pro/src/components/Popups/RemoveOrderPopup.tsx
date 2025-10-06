import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import OrderContent from "../Orders/OrderContent";
import ActionButton from "../ActionButton";
import { useState, useCallback } from "react";
import OrderService from "../../services/OrderService";
import { Order } from "../../models/order";
import { Alert, AlertType } from "../../models/alert";
import { Action, Mode } from "../../models/action";
import { useAlert } from "../Alert/AlertProvider";

export interface RemoveOrderPopupProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  selectedOrder: Order;
  className?: string;
}

export function RemoveOrderPopup({
  onClose,
  onSuccess,
  selectedOrder,
  className = "",
}: RemoveOrderPopupProps) {
  const [hasWarning, setHasWarning] = useState(false);
  const { showAlert } = useAlert();

  const handleOrderRemove = useCallback(async () => {
      OrderService.deleteOrder(selectedOrder.id)
        .then((status) => {
          onSuccess(
            `Zamówienie #${selectedOrder.orderNumber} usunięte pomyślnie`
          );
          setTimeout(() => {
            onClose();
          }, 600);
        })
        .catch((error) => {
          console.error("Error removing Order", error);
          showAlert("Błąd usuwania zamówienia.", AlertType.ERROR);
        });
  }, [
    showAlert,
    selectedOrder.id,
    selectedOrder.orderNumber,
    onSuccess,
    onClose,
  ]);

  const hasProducts = selectedOrder.orderProducts.length > 0;

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay remove-order ${className}`}
      onClick={onClose}
    >
      <div
        className="remove-order-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="edit-product-popup-header">
          <h2 className="popup-title">Na pewno? ⚠️</h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="remove-product-popup-interior">
          {!hasProducts ? (
            <section>
              <a className="remove-popup-warning-a">
                ❗❗❗ Zatwierdzenie spowoduje usunięcie Zamówienia.
              </a>
            </section>
          ) : (
            <>
              <section>
                <a className="remove-popup-warning-a">
                  ❗❗❗ Zatwierdzenie spowoduje usunięcie informacji o
                  Zamówieniu oraz Produktów z Magazynu:
                </a>
                <a className="remove-popup-warning-a-list-length">{`Ilość Produktów: ${selectedOrder.orderProducts.length}`}</a>
              </section>
                <OrderContent
                  order={selectedOrder}
                  action={Action.HISTORY}
                  mode={Mode.POPUP}
                  setHasWarning={setHasWarning}
                />
              {hasWarning && (
                <div className="popup-warning-explanation-display">
                  <img
                    src="src/assets/warning.svg"
                    alt="Warning"
                    className="order-item-warning-icon"
                  />
                  <a className="warning-explanation">
                    Konflikt: Chcesz usunąć więcej Produktów niż masz w
                    Magazynie!
                    <br />
                    Po zatwierdzeniu usuniesz dostępne Produkty.
                  </a>
                </div>
              )}
            </>
          )}
        </section>
        <section className="footer-popup-action-buttons">
          <div className="footer-cancel-button">
            <ActionButton
              src={"src/assets/cancel.svg"}
              alt={"Anuluj"}
              text={"Anuluj"}
              onClick={onClose}
            />
          </div>
          <div className="footer-confirm-button">
            <ActionButton
              src={"src/assets/tick.svg"}
              alt={"Zatwierdź"}
              text={"Zatwierdź"}
              onClick={handleOrderRemove}
            />
          </div>
        </section>
        {hasProducts && (
          <a className="popup-category-description">
            Jeśli chcesz usunąć pojedynczy Produkt z Zamówienia skorzystaj z
            zakładki - <i>Edytuj Zamówienie</i>
          </a>
        )}
      </div>
    </div>,
    portalRoot
  );
}

export default RemoveOrderPopup;
