import React from "react";
import { useState } from "react";
import CustomAlert from "./CustomAlert";
import ReactDOM from "react-dom";
import ProductForm from "./ProductForm";
import AllProductService from "../service/AllProductService";
import ProductActionButton from "./ProductActionButton";

const AddProductPopup = ({ onClose, handleResetAllFilters }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Sale");
  const [productCreationDTO, setProductCreationDTO] = useState(null);

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

  const getChangedFields = (initial, edited) => {
    const productCreationDTO = {};
    Object.keys(initial).forEach((key) => {
      if (JSON.stringify(initial[key]) !== JSON.stringify(edited[key])) {
        productCreationDTO[key] = edited[key];
      }
    });

    if (Object.keys(productCreationDTO).length > 0) {
      productCreationDTO.id = initial.id;
      if (!productCreationDTO.hasOwnProperty("category")) {
        productCreationDTO.category = initial.category;
      }
    }

    return productCreationDTO;
  };

  const handleCreateProduct = async (productCreationDTO) => {
    if (await checkForErrors(productCreationDTO)) return false;

    const { exists, product } =
      await AllProductService.checkIfProductExistsAndIsSoftDeleted(
        productCreationDTO,
        selectedCategory
      );

    if (exists) {
      const initialProduct = {
        id: product.id,
        name: product.productName,
        brandName: product.brand.brandName,
        estimatedShelfLife:
          (product?.category === "Equipment"
            ? product?.warrantyLength
            : product?.estimatedShelfLife) ?? 24,
        category: product.category,
        estimatedSellingPrice: product.sellingPrice ?? 0,
        description: product.description,
        isDeleted: product.isDeleted,
      };

      const categoryInstancesMap = {
        Sale: "saleProductInstances",
        Tool: "toolProductInstances",
        Equipment: "equipmentProductInstances",
      };
      const categoryInstancesKey = categoryInstancesMap[product.category];
      if (categoryInstancesKey) {
        initialProduct[categoryInstancesKey] = [];
      }

      productCreationDTO.isDeleted = false;

      if (
        categoryInstancesKey &&
        productCreationDTO[categoryInstancesKey]?.length > 0
      ) {
        productCreationDTO[categoryInstancesKey].forEach((instance) => {
          instance.productId = product.id;
          delete instance.id;
        });
      }

      const productForm = getChangedFields(initialProduct, productCreationDTO);
      console.log("DTO", productCreationDTO);
      console.log("PF", productForm);

      return AllProductService.updateProduct(productForm)
        .then((response) => {
          showAlert(
            `Produkt ${productCreationDTO.name} został utworzony!`,
            "success"
          );
          handleResetAllFilters();
          setTimeout(() => {
            onClose();
          }, 1200);
        })
        .catch((error) => {
          console.error("Error creating(updating) new Product.", error);
          showAlert("Błąd tworzenia produktu.", "error");
          return false;
        });
    } else {
      const productArray = [productCreationDTO];
      return AllProductService.createNewProducts(productArray)
        .then((response) => {
          console.log("Response", response);
          showAlert(
            `Produkt ${productCreationDTO.name} został utworzony!`,
            "success"
          );
          handleResetAllFilters();
          setTimeout(() => {
            onClose();
          }, 1200);
        })
        .catch((error) => {
          console.error("Error creating new Product.", error);
          showAlert("Błąd tworzenia produktu.", "error");
          return false;
        });
    }
  };

  const checkForErrors = async (productForm) => {
    if (!productForm.brandName || !productForm.name) {
      showAlert("Brak pełnych informacji o produkcie!", "error");
      return true;
    }

    const productExists = await AllProductService.checkIfProductExists(
      productForm,
      selectedCategory
    );
    if (productExists) {
      showAlert("Produkt o takiej nazwie już istnieje!", "error");
      /* setTimeout(() => {
        showAlert(
          "Jeśli chcesz zmienić liczbę istniejącego produktu użyj -> Edytuj ",
          "info"
        );
      }, 3030); */
      return true;
    }

    if (productForm.brandName.trim().length <= 2) {
      showAlert("Nazwa marki za krótka! (2+)", "error");
      return true;
    }

    if (productForm.category !== "Tool" && productForm.shelfLife === 0) {
      showAlert("Okres przydatności musi być  > 0!", "error");
      return true;
    }

    const instancesProperty = `${selectedCategory.toLowerCase()}ProductInstances`;
    if (
      productForm[instancesProperty].length > 0 &&
      (selectedCategory === "Sale" || selectedCategory === "Equipment")
    ) {
      for (let instance of productForm[instancesProperty]) {
        if (selectedCategory === "Sale" && instance.sellingPrice <= 0) {
          showAlert("Cena sprzedaży produktu musi być  > 0!", "error");
          return true;
        }

        const today = new Date();
        const diffInMs = Math.abs(instance.shelfLife - today);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInDays <= 3) {
          showAlert("Data ważności krótsza niż 3 dni!", "error");
          return true;
        }
      }
    }

    return false;
  };

  return ReactDOM.createPortal(
    <div className="add-popup-overlay" onClick={onClose}>
      <div
        className="new-product-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="new-product-popup-header">
          <h2 className="popup-title">Dodaj Nowy Produkt</h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="new-product-popup-interior">
          <ProductForm
            onForwardProductCreationForm={(productForm) => {
              setProductCreationDTO(productForm);
            }}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            action="Create"
          />
        </section>
        <div className="popup-footer-container"></div>

        <ProductActionButton
            src={"src/assets/tick.svg"}
            alt={"Zapisz"}
            text={"Zapisz"}
            onClick={async () => handleCreateProduct(productCreationDTO)}
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

export default AddProductPopup;
