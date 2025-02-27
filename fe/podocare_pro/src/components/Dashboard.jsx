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

  const handleFilterChange = (newFilter) => {
    setProductFilterDTO(newFilter);
  };

  return (
    <div className="dashboard-panel">
      <NavigationBar
        onFilter={handleFilterChange}
        productFilterDTO={productFilterDTO}
      />
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
      <SupplyList productFilterDTO={productFilterDTO} />
      {isAddNewProductsPopupOpen && (
          <AddProductPopup

          onClose={() => setIsAddNewProductsPopupOpen(false)}

          />
        )}
    </div>
  );
};

export default Dashboard;
