import React from "react";
import ReactDOM from "react-dom";
import OrderContent from "./OrderContent";
import ProductActionButton from "./ProductActionButton";
import CustomAlert from "./CustomAlert";
import { useState, useEffect } from "react";
import OrderService from "../service/OrderService";

const RemoveOrderPopup = ({
  onClose,
  handleResetAllFilters,
  selectedOrder,
}) => {
  const [hasWarning, setHasWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);

  const showAlert = (message, variant) => {
    if (variant === "success") {
      setSuccessMessage(message);
      setErrorMessage(null);
      setInfoMessage(null);
    } else if (variant === "error") {
      setErrorMessage(message);
      setSuccessMessage(null);
      setInfoMessage(null);
    } else {
      setErrorMessage(null);
      setSuccessMessage(null);
      setInfoMessage(message);
    }

    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 3000);
  };

  useEffect(() => {
    console.log("s", selectedOrder);
  }, [selectedOrder]);

  const handleOrderRemove = async (orderId) => {
    OrderService.deleteOrder(orderId)
      .then((data) => {
        const success = true;
        const mode = "Remove";
        handleResetAllFilters(success, mode);
        setTimeout(() => {
          onClose();
        }, 600);
      })
      .catch((error) => {
        console.error("Error removing Order", error);
        showAlert("Błąd usuwania zamówienia.", "error");
      });
  };

  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay remove-order ${
        selectedOrder.orderProductDTOList.length === 0 ? "short-version" : ""
      } `}
      onClick={onClose}
    >
      <div
        className="remove-order-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="edit-product-popup-header">
          <h2 className="popup-title">Na pewno? ⛔</h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="remove-product-popup-interior">
          {selectedOrder.orderProductDTOList.length === 0 ? (
            <section>
              <a className="remove-popup-warning-a">
                ❗❗❗ Zatwierdzenie spowoduje usunięcie Zamówienia.
              </a>
              <br />
            </section>
          ) : (
            <>
              <section>
                <a className="remove-popup-warning-a">
                  ❗❗❗ Zatwierdzenie spowoduje usunięcie informacji o
                  Zamówieniu oraz Produktów z Magazynu:
                </a>
                <br />
                <a className="remove-popup-warning-a-list-length">{`Ilość Produktów: ${selectedOrder.orderProductDTOList.length}`}</a>
              </section>
              {selectedOrder && (
                <OrderContent
                  order={selectedOrder}
                  action={"History"}
                  mode={"Popup"}
                  setHasWarning={setHasWarning}
                />
              )}
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
        {selectedOrder && (
          <>
            <section className="footer-popup-action-buttons">
              <div className="footer-cancel-button">
                <ProductActionButton
                  src={"src/assets/cancel.svg"}
                  alt={"Anuluj"}
                  text={"Anuluj"}
                  onClick={onClose}
                />
              </div>
              <div className="footer-confirm-button">
                <ProductActionButton
                  src={"src/assets/tick.svg"}
                  alt={"Zatwierdź"}
                  text={"Zatwierdź"}
                  onClick={() => handleOrderRemove(selectedOrder.orderId)}
                />
              </div>
            </section>
            {selectedOrder.orderProductDTOList.length > 0 && (
              <a className="popup-category-description">
                Jeśli chcesz usunąć pojedynczy Produkt z Zamówienia skorzystaj z
                zakładki - <i>Edytuj Zamówienie</i>
              </a>
            )}
          </>
        )}
        {alertVisible && (
          <CustomAlert
            message={errorMessage || successMessage || infoMessage}
            variant={
              errorMessage ? "error" : successMessage ? "success" : "info"
            }
          />
        )}
      </div>
    </div>,
    document.getElementById("portal-root")
  );
};

export default RemoveOrderPopup;
