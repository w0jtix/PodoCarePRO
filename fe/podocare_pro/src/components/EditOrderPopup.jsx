import React from "react";
import { useState, useEffect } from "react";
import CustomAlert from "./CustomAlert";
import ReactDOM from "react-dom";
import OrderForm from "./OrderForm";
import AllProductService from "../service/AllProductService";
import ProductActionButton from "./ProductActionButton";

const EditOrderPopup = ({ onClose, handleResetAllFilters, selectedOrder }) => {
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

  /* const handleSaveProduct = async (productCreationDTO) => {
    if (await checkForErrors(productCreationDTO)) return false;
    return AllProductService.updateProduct(productCreationDTO)
      .then((response) => {
        showAlert("Produkt zaktualizowany!", "success");
        handleResetAllFilters();
        setTimeout(() => {
          onClose();
        }, 1200);
      })
      .catch((error) => {
        console.error("Error updating new Product.", error);
        showAlert("Błąd aktualizacji produktu.", "error");
        return false;
      });
  };

  const checkForErrors = async (productForm) => {
    if (!productForm || Object.keys(productForm).length === 0) {
      showAlert("Brak zmian!", "error");
      return true;
    }

    if (productForm.name?.trim() === "") {
      showAlert("Uzupełnij nazwę produktu!", "error");
      return true;
    }
    if (productForm.name?.trim().length <= 2) {
      showAlert("Nazwa produktu za krótka! (2+)", "error");
      return true;
    }

    if (productForm.brandName?.trim().length <= 2) {
      showAlert("Nazwa marki za krótka! (2+)", "error");
      return true;
    }

    const instancesProperty = `${selectedCategory.toLowerCase()}ProductInstances`;
    if (
      productForm[instancesProperty]?.length > 0 &&
      selectedCategory === "Sale"
    ) {
      for (let instance of productForm[instancesProperty]) {
        if (instance.sellingPrice !== undefined && instance.sellingPrice <= 0) {
          showAlert("Nowa cena sprzedaży produktu musi być  > 0!", "error");
          return true;
        }
      }
    }
  }; */

  return ReactDOM.createPortal(
    <div className="add-popup-overlay" onClick={onClose}>
      <div
        className="new-product-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section
          className="edit-product-popup-header"
        >
          <h2 className="popup-title">Edytuj Zamówienie</h2>
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
            <OrderForm
              selectedOrder={selectedOrder}
            />
          )}
        </section>
        {selectedOrder && (
          <>
            <div className="popup-footer-container"></div>
            <ProductActionButton
            src={"src/assets/tick.svg"}
            alt={"Zapisz"}
            text={"Zapisz"}
            /* onClick={async () => handleSaveProduct(productCreationDTO)} */
          />
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

export default EditOrderPopup;
