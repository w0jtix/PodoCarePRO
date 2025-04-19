import React, { useEffect } from "react";
import NavigationBar from "./NavigationBar";
import SupplyList from "./SupplyList";
import { useState } from "react";
import ProductActionButton from "./ProductActionButton";
import AddProductPopup from "./AddProductPopup";
import EditProductPopup from "./EditProductPopup";
import RemoveProductPopup from "./RemoveProductPopup";
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
  const [alertVisible, setAlertVisible] = useState(false);

  const showAlert = (message, variant) => {
    if (variant === "success") {
      setSuccessMessage(message);
      setErrorMessage(null);
    } else {
      setErrorMessage(message);
      setSuccessMessage(null);
    }

    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 2500);
  };

  const handleResetAllFilters = (success, mode) => {
    if (success) {
      if(mode === "Remove") {
        showAlert("Produkt usunięty!", "success");
      } else if( mode === "Edit") {
        showAlert("Produkt zaktualizowany!", "success");
      }
      
    }
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
          handleResetAllFilters={handleResetAllFilters}
          selectedProduct={selectedProduct}
        />
      )}
      {alertVisible && (
        <CustomAlert
          message={errorMessage || successMessage}
          variant={errorMessage ? "error" : "success"}
        />
      )}
    </div>
  );
};

export default Dashboard;
