import React, { useEffect } from "react";
import NavigationBar from "./NavigationBar";
import SupplyList from "./SupplyList";
import { useState, useCallback } from "react";
import ActionButton from "../ActionButton";
import AddEditProductPopup from "../Popups/AddEditProductPopup";
import RemoveProductPopup from "../Popups/RemoveProductPopup";
import CategoryPopup from "../Popups/CategoryPopup";
import CustomAlert from "../CustomAlert";
import { Product, ProductFilterDTO } from "../../models/product";
import { Alert, AlertType } from "../../models/alert";

export function Dashboard() {
  const [isAddNewProductsPopupOpen, setIsAddNewProductsPopupOpen] =
    useState<boolean>(false);
  const [isEditProductsPopupOpen, setIsEditProductsPopupOpen] =
    useState<boolean>(false);
  const [isRemoveProductsPopupOpen, setIsRemoveProductsPopupOpen] =
    useState<boolean>(false);
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] =
    useState<boolean>(false);
  const [filter, setFilter] = useState<ProductFilterDTO>({
    categoryIds: null,
    brandIds: null,
    keyword: "",
    includeZero: false,
    isDeleted: false,
  });
  const [resetTriggered, setResetTriggered] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [alert, setAlert] = useState<Alert | null>(null);

  const showAlert = useCallback(
    (message: string, variant: AlertType) => {
      setAlert({ message, variant });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    },
    []
  );

  const handleResetFiltersAndData = useCallback(() => {
    setFilter({
      categoryIds: null,
      brandIds: null,
      keyword: "",
      includeZero: false,
      isDeleted: false,
    });
    setResetTriggered((prev) => !prev);
  }, []);

  const handlePopupSuccess = useCallback(
    (message: string) => {
      showAlert(message, AlertType.SUCCESS);
      handleResetFiltersAndData();
    },
    [showAlert, handleResetFiltersAndData]
  );

  const handleFilterChange = useCallback((newFilter: ProductFilterDTO) => {
    setFilter(newFilter);
  }, []);

  const toggleIncludeZero = useCallback(() => {
    setFilter((prev) => ({
      ...prev,
      includeZero: !prev.includeZero,
    }));
  }, []);

  return (
    <div className="dashboard-panel">
      <NavigationBar
        onFilter={handleFilterChange}
        filter={filter}
        onReset={handleResetFiltersAndData}
        resetTriggered={resetTriggered}
      />
      <section className="action-buttons-section">
        <div className={`button-layer ${filter.includeZero ? "selected" : ""}`}>
          <ActionButton
            src={
              filter.includeZero
                ? "src/assets/toggleSelected.svg"
                : "src/assets/toggle.svg"
            }
            alt={"Include Zero"}
            text={"St. Mag = 0"}
            onClick={toggleIncludeZero}
          />
        </div>
        <section className="products-action-buttons">
          <ActionButton
            src={"src/assets/addNew.svg"}
            alt={"Nowy Produkt"}
            text={"Nowy Produkt"}
            onClick={() => setIsAddNewProductsPopupOpen(true)}
          />
          <ActionButton
            src={"src/assets/addNew.svg"}
            alt={"Nowa Kategoria"}
            text={"Nowa Kategoria"}
            onClick={() => setIsCategoryPopupOpen(true)}
          />
        </section>
      </section>
      <SupplyList
        filter={filter}
        setIsAddNewProductsPopupOpen={setIsAddNewProductsPopupOpen}
        setIsEditProductsPopupOpen={setIsEditProductsPopupOpen}
        setIsRemoveProductsPopupOpen={setIsRemoveProductsPopupOpen}
        setSelectedProduct={setSelectedProduct}
      />
      {isAddNewProductsPopupOpen && (
        <AddEditProductPopup
          onClose={() => setIsAddNewProductsPopupOpen(false)}
          onReset={handlePopupSuccess}
          selectedProduct={null}
        />
      )}
      {isEditProductsPopupOpen && selectedProduct && (
        <AddEditProductPopup
          onClose={() => {
            setIsEditProductsPopupOpen(false);
            setSelectedProduct(null);
          }}
          onReset={handlePopupSuccess}
          selectedProduct={selectedProduct}
        />
      )}
      {isRemoveProductsPopupOpen && (
        <RemoveProductPopup
          onClose={() => setIsRemoveProductsPopupOpen(false)}
          onReset={handlePopupSuccess}
          selectedProduct={selectedProduct}
        />
      )}
      {isCategoryPopupOpen && (
        <CategoryPopup
          onClose={() => setIsCategoryPopupOpen(false)}
          onReset={handlePopupSuccess}
        />
      )}
      {alert && <CustomAlert message={alert.message} variant={alert.variant} />}
    </div>
  );
}

export default Dashboard;
