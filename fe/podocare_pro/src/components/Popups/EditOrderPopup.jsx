import React from "react";
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import OrderCreator from "../Orders/OrderCreator";

const EditOrderPopup = ({
  onClose,
  handleResetFiltersAndData,
  selectedOrder,
}) => {
  const [hasWarning, setHasWarning] = useState(false);

  return ReactDOM.createPortal(
    <div className="add-popup-overlay edit-order" onClick={onClose}>
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
          {selectedOrder && (
            <OrderCreator
              selectedOrder={selectedOrder}
              hasWarning={hasWarning}
              setHasWarning={setHasWarning}
              handleResetFiltersAndData={handleResetFiltersAndData}
              onClose={onClose}
            />
          )}
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
    document.getElementById("portal-root")
  );
};

export default EditOrderPopup;
