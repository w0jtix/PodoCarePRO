import React, { useEffect } from "react";
import { useState } from "react";
import CustomAlert from "../CustomAlert";
import ReactDOM from "react-dom";
import ProductForm from "../ProductForm";
import AllProductService from "../../service/AllProductService";
import ProductActionButton from "../ProductActionButton";
import BrandService from "../../service/BrandService";

const AddEditProductPopup = ({ onClose, handleResetFiltersAndData, selectedProduct }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [productDTO, setProductDTO] = useState(null);
  const [brandToCreate, setBrandToCreate] = useState(null);

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

  const action = selectedProduct ? "Edit" : "Create";

  const handleBrandToCreate = async (brandToCreate) => {
    if (await checkForErrorsBrandCreate(brandToCreate)) return false;

    try {
      const data = await BrandService.createBrand(brandToCreate);
      return data;
    } catch (error) {
      console.error("Error creating new Brand.", error);
      showAlert("Błąd w trakcie tworzenia produktu.", "error");
      return false;
    }
  };

  const handleProductAction = async (productDTO) => {

    let productRequestDTO = { ...productDTO };

    if (brandToCreate) {
      const newBrand = await handleBrandToCreate(brandToCreate);
      if (!newBrand) {
        return false;
      }
      productRequestDTO.brandId = newBrand.id;
    }
    if (await checkForErrorsProductAction(productRequestDTO)) {
      return false;
    }
    if(action == "Create") {
      return AllProductService.createNewProduct(productRequestDTO)
      .then((data) => {
        showAlert(
          `Produkt ${productRequestDTO.name} został utworzony!`,
          "success"
        );
        handleResetFiltersAndData();
        setTimeout(() => {
          onClose();
        }, 1200);
      })
      .catch((error) => {
        console.error("Error creating new Product.", error);
        showAlert("Błąd tworzenia produktu.", "error");
        return false;
      })
    } else if (action == "Edit") {
      return AllProductService.updateProduct(productRequestDTO)
      .then((data) => {
        showAlert(
          `Produkt ${productRequestDTO.name} zaktualizowany!`,
          "success"
        );
        handleResetFiltersAndData();
        setTimeout(() => {
          onClose();
        }, 1200);
      })
      .catch((error) => {
        console.error("Error updating Product.", error);
        showAlert("Błąd aktualizacji produktu.", "error");
        return false;
      })    
  }
  };

  const checkForErrorsBrandCreate = async (brandToCreate) => {
    if (brandToCreate.name.trim().length <= 2) {
      showAlert("Nazwa marki za krótka! (2+)", "error");
      return true;
    }
    return false;
  };

  const checkForErrorsProductAction = async (productForm) => {
    if (
      Object.values(productForm).some(
        (value) => value === null || value === undefined
      )
    ) {
      showAlert("Brak pełnych informacji o produkcie!", "error");
      return true;
    }

    if (productForm.name.trim().length <= 2) {
      showAlert("Nazwa produktu za krótka! (2+)", "error");
      return true;
    }

    const noChangesDetected =
    productForm.name === selectedProduct.name &&
    productForm.categoryId === selectedProduct.categoryId &&
    productForm.brandId === selectedProduct.brandId &&
    (productForm.description ?? "") === (selectedProduct.description ?? "") &&
    productForm.supply === selectedProduct.supply;

    if (action =="Edit" && noChangesDetected) {
      showAlert("Brak zmian!", "error");
      return true;
    }

    return false;
  };

  return ReactDOM.createPortal(
    <div className="add-popup-overlay" onClick={onClose}>
      <div
        className="product-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header">
          <h2 className="popup-title">{action === "Create" ? "Dodaj Nowy Produkt" : "Edytuj Produkt"}</h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="product-popup-interior">
          <ProductForm
            onForwardProductForm={(productForm) => {
              setProductDTO(productForm);
            }}
            onForwardBrand={(brandToCreate) => setBrandToCreate(brandToCreate)}
            action={action}
            selectedProduct={selectedProduct}
          />
        </section>
        <div className="popup-footer-container"></div>
        <ProductActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={async () => handleProductAction(productDTO)}
        />
        <a className="popup-category-description">
          Jeśli chcesz przypisać produkt do zamówienia skorzystaj z zakładki -{" "}
          <i>Zamówienia</i>
        </a>
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

export default AddEditProductPopup;
