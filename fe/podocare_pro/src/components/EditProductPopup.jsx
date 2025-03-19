import React from "react";
import { useState, useEffect } from "react";
import CustomAlert from "./CustomAlert";
import ReactDOM from "react-dom";
import ProductForm from "./ProductForm";
import AllProductService from "../service/AllProductService";

const EditProductPopup = ({ onClose, handleResetAllFilters, selectedProduct }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Sale");
  const [productCreationDTO, setProductCreationDTO] = useState(null);
  const [categoryChanged, setCategoryChanged] = useState(false);

  const categories = ["Sale", "Tool", "Equipment"];
  const categoryMap = {
    Sale: "Produkty",
    Tool: "Narzędzia",
    Equipment: "Sprzęt",
  };

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

  const handleSaveProduct = async (productCreationDTO) => {
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
  };

  useEffect(() => {
    if (selectedProduct) {
      setSelectedCategory(selectedProduct.category);
    }
  }, [selectedProduct]);

  return ReactDOM.createPortal(
    <div className="add-popup-overlay" onClick={onClose}>
      <div
        className="new-product-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section
          className="edit-product-popup-header"
        >
          <h2 className="popup-title">Edytuj Produkt</h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="new-product-popup-interior">
          {selectedProduct && (
            <ProductForm
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              action="Edit"
              selectedProduct={selectedProduct}
              setProductCreationDTO={setProductCreationDTO}
              setCategoryChanged={setCategoryChanged}
            />
          )}
        </section>
        {selectedProduct && (
          <>
            <div className="popup-footer-container"></div>
            <button
              className="popup-confirm-button add-product"
              onClick={async () => handleSaveProduct(productCreationDTO)}
            >
              <img
                src="src/assets/tick.svg"
                alt="tick"
                className="popup-tick-icon"
              />
              <a>Zapisz</a>
            </button>
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

export default EditProductPopup;
