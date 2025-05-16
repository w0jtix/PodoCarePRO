import React, { useEffect } from "react";
import NavigationBar from "./NavigationBar";
import SupplyList from "./SupplyList";
import { useState } from "react";
import ProductActionButton from "../ProductActionButton";
import AddEditProductPopup from "../Popups/AddEditProductPopup";
import RemoveProductPopup from "../Popups/RemoveProductPopup";
import CategoryPopup from "../Popups/CategoryPopup";
import CustomAlert from "../CustomAlert";

const Dashboard = () => {
  const [isAddNewProductsPopupOpen, setIsAddNewProductsPopupOpen] =
    useState(false);
  const [isEditProductsPopupOpen, setIsEditProductsPopupOpen] = useState(false);
  const [isRemoveProductsPopupOpen, setIsRemoveProductsPopupOpen] =
    useState(false);
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [filters, setFilters] = useState({
    categoryIds: [],
    brandIds: [],
    keyword: "",
    includeZero: false,
    isDeleted: false,
  });
  const [resetTriggered, setResetTriggered] = useState(false);
  const [includeZero, setIncludeZero] = useState(false);
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

  const handleResetFiltersAndData = (success, mode) => {
    if (success) {
      if (mode === "Remove") {
        showAlert("Produkt usunięty!", "success");
      } else if (mode === "Edit") {
        showAlert("Produkt zaktualizowany!", "success");
      }
    }
    setFilters({
      categoryIds: [],
      brandIds: [],
      keyword: "",
      includeZero: false,
      isDeleted: false,
    });
    setIncludeZero(false);
    setResetTriggered((prev) => !prev);
  };

  const handleFilterChange = (newFilter) => {
    setFilters(newFilter);
  };

  useEffect(() => {
    const newFilterDTO = {
      ...filters,
      includeZero,
    };
    handleFilterChange(newFilterDTO);
  }, [includeZero]);

  return (
    <div className="dashboard-panel">
      <NavigationBar
        onFilter={handleFilterChange}
        filters={filters}
        handleResetFiltersAndData={handleResetFiltersAndData}
        resetTriggered={resetTriggered}
      />
      <section className="action-buttons-section">
        <div className={`button-layer ${includeZero ? "selected" : ""}`}>
          <ProductActionButton
            src={
              includeZero
                ? "src/assets/toggleSelected.svg"
                : "src/assets/toggle.svg"
            }
            alt={"Include Zero"}
            text={"St. Mag = 0"}
            onClick={() => setIncludeZero((prev) => !prev)}
          />
        </div>
        <section className="products-action-buttons">
          <ProductActionButton
            src={"src/assets/addNew.svg"}
            alt={"Nowy Produkt"}
            text={"Nowy Produkt"}
            onClick={() => setIsAddNewProductsPopupOpen(true)}
          />
          <ProductActionButton
            src={"src/assets/addNew.svg"}
            alt={"Nowa Kategoria"}
            text={"Nowa Kategoria"}
            onClick={() => setIsCategoryPopupOpen(true)}
          />
        </section>
      </section>
      <SupplyList
        filters={filters}
        setIsAddNewProductsPopupOpen={setIsAddNewProductsPopupOpen}
        setIsEditProductsPopupOpen={setIsEditProductsPopupOpen}
        setIsRemoveProductsPopupOpen={setIsRemoveProductsPopupOpen}
        setSelectedProduct={setSelectedProduct}
      />
      {isAddNewProductsPopupOpen && (
        <AddEditProductPopup
          onClose={() => setIsAddNewProductsPopupOpen(false)}
          handleResetFiltersAndData={handleResetFiltersAndData}
        />
      )}
      {isEditProductsPopupOpen && (
        <AddEditProductPopup
          onClose={() => setIsEditProductsPopupOpen(false)}
          handleResetFiltersAndData={handleResetFiltersAndData}
          selectedProduct={selectedProduct}
        />
      )}
      {isRemoveProductsPopupOpen && (
        <RemoveProductPopup
          onClose={() => setIsRemoveProductsPopupOpen(false)}
          handleResetFiltersAndData={handleResetFiltersAndData}
          selectedProduct={selectedProduct}
        />
      )}
      {isCategoryPopupOpen && (
        <CategoryPopup
          onClose={() => setIsCategoryPopupOpen(false)}
          handleResetFiltersAndData={handleResetFiltersAndData}
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
