import React, { useEffect } from "react";
import NavigationBar from "./NavigationBar";
import SupplyList from "./SupplyList";
import { useState } from "react";
import ProductActionButton from "./ProductActionButton";
import AddProductPopup from "./AddProductPopup";
import EditProductPopup from "./EditProductPopup";
import RemoveProductPopup from "./RemoveProductPopup";
import AllProductService from "../service/AllProductService";
import CustomAlert from "./CustomAlert";

const Dashboard = () => {
  const [isAddNewProductsPopupOpen, setIsAddNewProductsPopupOpen] =
    useState(false);
  const [isEditProductsPopupOpen, setIsEditProductsPopupOpen] = useState(false);
  const [isRemoveProductsPopupOpen, setIsRemoveProductsPopupOpen] =
    useState(false);
  const [productFilterDTO, setProductFilterDTO] = useState({
    productTypes: ["Sale", "Tool", "Equipment"],
    selectedBrandIds: [],
    keyword: "",
  });
  const [resetTriggered, setResetTriggered] = useState(false);
  const [showZeroProducts, setShowZeroProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
    }, 700);
  };

  const handleResetAllFilters = () => {
    setProductFilterDTO({
      productTypes: ["Sale", "Tool", "Equipment"],
      selectedBrandIds: [],
      keyword: "",
    });
    setResetTriggered((prev) => !prev);
  };

  const handleFilterChange = (newFilter) => {
    setProductFilterDTO(newFilter);
  };

  const handleProductRemove = async (productId) => {
    AllProductService.deleteProductAndActiveInstances(productId)
      .then((response) => {
        showAlert("Produkt usunięty!", "success");
        handleResetAllFilters();
        setTimeout(() => {
          setIsRemoveProductsPopupOpen(false);
        }, 1200);
      })
      .catch((error) => {
        console.error("Error removing Product", error);
        showAlert("Błąd usuwania produktu.", "error");
      });
  };

  return (
    <div className="dashboard-panel">
      <NavigationBar
        onFilter={handleFilterChange}
        productFilterDTO={productFilterDTO}
        handleResetAllFilters={handleResetAllFilters}
        resetTriggered={resetTriggered}
      />
      <section className="action-buttons-section">
        <div className={`button-layer ${showZeroProducts ? "selected" : ""}`}>
          <ProductActionButton
            src={
              showZeroProducts
                ? "src/assets/toggleSelected.svg"
                : "src/assets/toggle.svg"
            }
            alt={"Dodaj Produkt"}
            text={"St. Mag = 0"}
            onClick={() => setShowZeroProducts((prev) => !prev)}
          />
        </div>
        <section className="products-action-buttons">
          <ProductActionButton
            src={"src/assets/addNew.svg"}
            alt={"Dodaj Produkt"}
            text={"Dodaj nowy"}
            onClick={() => setIsAddNewProductsPopupOpen(true)}
          />
        </section>
      </section>
      <SupplyList
        productFilterDTO={productFilterDTO}
        showZeroProducts={showZeroProducts}
        setIsAddNewProductsPopupOpen={setIsAddNewProductsPopupOpen}
        setIsEditProductsPopupOpen={setIsEditProductsPopupOpen}
        setIsRemoveProductsPopupOpen={setIsRemoveProductsPopupOpen}
        setSelectedProduct={setSelectedProduct}
        handleProductRemove={handleProductRemove}
      />
      {isAddNewProductsPopupOpen && (
        <AddProductPopup
          onClose={() => setIsAddNewProductsPopupOpen(false)}
          handleResetAllFilters={handleResetAllFilters}
        />
      )}
      {isEditProductsPopupOpen && (
        <EditProductPopup
          onClose={() => setIsEditProductsPopupOpen(false)}
          handleResetAllFilters={handleResetAllFilters}
          selectedProduct={selectedProduct}
        />
      )}
      {isRemoveProductsPopupOpen && (
        <RemoveProductPopup
          onClose={() => setIsRemoveProductsPopupOpen(false)}
          handleProductRemove={handleProductRemove}
          selectedProduct={selectedProduct}
        />
      )}
      {alertVisible && (
        <CustomAlert
          message={errorMessage || successMessage || infoMessage}
          variant={errorMessage ? "error" : successMessage ? "success" : "info"}
        />
      )}
    </div>
  );
};

export default Dashboard;
