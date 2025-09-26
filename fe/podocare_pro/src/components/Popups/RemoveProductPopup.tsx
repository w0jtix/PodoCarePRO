import React from "react";
import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import AllProductService from "../../services/AllProductService";
import { useAlert } from "../Alert/AlertProvider";
import { useState, useCallback } from "react";
import { Product } from "../../models/product";
import { Alert, AlertType } from "../../models/alert";
import { Action } from "../../models/action";

export interface RemoveProductPopupProps {
  onClose: () => void;
  onReset: (message: string) => void;
  selectedProduct?: Product | null;
  className?: string;
}

export function RemoveProductPopup ({
  onClose,
  onReset,
  selectedProduct,
  className = ""
}: RemoveProductPopupProps) {
  const { showAlert } = useAlert();

  const handleProductRemove = useCallback(async () => {
    if(!selectedProduct) return;
    AllProductService.deleteProduct(selectedProduct.id)
      .then(() => {
        onReset(`Produkt ${selectedProduct.name} usunięty!`);
        setTimeout(() => {
          onClose();
        }, 600);
      })
      .catch((error) => {
        console.error("Error removing Product", error);
        showAlert("Błąd usuwania produktu.", AlertType.ERROR);
      });
  }, [onReset, onClose, showAlert]);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay short-version ${className}`} onClick={onClose}>
      <div
        className="remove-product-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header">
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
          <section>
            <a className="remove-popup-warning-a">
              ❗❗❗ Zatwierdzenie spowoduje usunięcie informacji o produkcie.
            </a>
            <br />
          </section>
        </section>
        {selectedProduct && (
          <>
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
                  onClick={handleProductRemove}
                />
              </div>
            </section>
            <a className="popup-category-description">
              Jeśli chcesz edytować liczbę produktów w zapasie skorzystaj z
              zakładki - <i>Edytuj Produkt</i>
            </a>
          </>
        )}
      </div>
    </div>,
    portalRoot
  );
};

export default RemoveProductPopup;
