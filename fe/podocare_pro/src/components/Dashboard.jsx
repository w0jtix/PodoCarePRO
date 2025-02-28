import React from "react";
import NavigationBar from "./NavigationBar";
import SupplyList from "./SupplyList";
import { useState } from "react";
import ProductActionButton from "./ProductActionButton";
import AddProductPopup from "./AddProductPopup";

const Dashboard = () => {
  const [isAddNewProductsPopupOpen, setIsAddNewProductsPopupOpen] =
    useState(false);
  const [productFilterDTO, setProductFilterDTO] = useState({
    productTypes: ["Sale", "Tool", "Equipment"],
    selectedBrandIds: [],
    keyword: "",
  });
  const [resetTriggered, setResetTriggered] = useState(false);
  const [showZeroProducts, setShowZeroProducts] = useState(false);

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

  return (
    <div className="dashboard-panel">
      <NavigationBar
        onFilter={handleFilterChange}
        productFilterDTO={productFilterDTO}
        handleResetAllFilters={handleResetAllFilters}
        resetTriggered={resetTriggered}
      />
      <section className="action-buttons-section">
        <div
          className={`button-layer ${showZeroProducts ? "selected" : ""}`}
        >
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
          <ProductActionButton
            src={"src/assets/edit.svg"}
            alt={"Edytuj Produkt"}
            text={"Edytuj"}
          />
          <ProductActionButton
            src={"src/assets/cancel.svg"}
            alt={"Usuń Produkt"}
            text={"Usuń"}
          />
        </section>
      </section>
      <SupplyList 
      productFilterDTO={productFilterDTO} 
      showZeroProducts={showZeroProducts}
      />
      {isAddNewProductsPopupOpen && (
        <AddProductPopup onClose={() => setIsAddNewProductsPopupOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;
