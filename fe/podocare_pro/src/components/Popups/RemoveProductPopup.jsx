import React from "react";
import ReactDOM from "react-dom";
import ProductActionButton from "../ProductActionButton";
import AllProductService from "../../service/AllProductService";
import CustomAlert from "../CustomAlert";
import { useState } from "react";

const RemoveProductPopup = ({
  onClose,
  handleResetFiltersAndData,
  selectedProduct,
}) => {
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

  const handleProductRemove = async (productId) => {
    AllProductService.deleteProduct(productId)
      .then(() => {
        const success = true;
        const mode = "Remove";
        handleResetFiltersAndData(success, mode);
        setTimeout(() => {
          onClose();
        }, 600);
      })
      .catch((error) => {
        console.error("Error removing Product", error);
        showAlert("Błąd usuwania produktu.", "error");
      });
  };

  return ReactDOM.createPortal(
    <div
      className="add-popup-overlay short-version"
      onClick={onClose}
    >
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
                  onClick={() => handleProductRemove(selectedProduct.id)}
                />
              </div>
            </section>
              <a className="popup-category-description">
                Jeśli chcesz edytować liczbę produktów w zapasie skorzystaj z
                zakładki - <i>Edytuj Produkt</i>
              </a>
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

export default RemoveProductPopup;
