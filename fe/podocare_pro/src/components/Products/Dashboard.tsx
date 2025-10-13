import React, { useEffect } from "react";
import NavigationBar from "../NavigationBar";
import SupplyList from "./SupplyList";
import { useState, useCallback } from "react";
import ActionButton from "../ActionButton";
import AddEditProductPopup from "../Popups/AddEditProductPopup";
import RemovePopup from "../Popups/RemovePopup";
import CategoryPopup from "../Popups/CategoryPopup";
import { useAlert } from "../Alert/AlertProvider";
import { Product, ProductFilterDTO } from "../../models/product";
import { Alert, AlertType } from "../../models/alert";
import ListActionSection from "../ListActionSection";
import { ProductCategory, NewProductCategory } from "../../models/categories";
import CategoryService from "../../services/CategoryService";
import { Action } from "../../models/action";
import { validateCategoryForm } from "../../utils/validators";
import { extractCategoryErrorMessage } from "../../utils/errorHandler";
import AllProductService from "../../services/AllProductService";

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
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const { showAlert } = useAlert();

  const fetchCategories = useCallback(async () => {
    CategoryService.getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        setCategories([]);
        console.error("Error fetching categories:", error);
      });
  }, []);

  const handleResetFiltersAndData = useCallback(() => {
    setFilter({
      categoryIds: null,
      brandIds: null,
      keyword: "",
      includeZero: false,
      isDeleted: false,
    });
    fetchCategories();
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

  const handleKeywordChange = useCallback((newKeyword: string) => {
    setFilter((prev) => ({
      ...prev,
      keyword: newKeyword,
    }));
  }, []);

  const toggleIncludeZero = useCallback(() => {
    setFilter((prev) => ({
      ...prev,
      includeZero: !prev.includeZero,
    }));
  }, []);

  const handleCategoryAction = useCallback(
    async (categoryDTO: ProductCategory | NewProductCategory) => {
      const action = "id" in categoryDTO ? Action.EDIT : Action.CREATE;

      const error = validateCategoryForm(
        categoryDTO,
        "id" in categoryDTO ? (categoryDTO as ProductCategory) : undefined,
        action,
        categories
      );
      if (error) {
        showAlert(error, AlertType.ERROR);
        return;
      }

      try {
        if (action === Action.CREATE) {
          await CategoryService.createCategory(
            categoryDTO as NewProductCategory
          );
          handlePopupSuccess(`Kategoria ${categoryDTO.name} utworzona!`);
        } else {
          await CategoryService.updateCategory(
            (categoryDTO as ProductCategory).id,
            categoryDTO as ProductCategory
          );
          handlePopupSuccess(`Kategoria ${categoryDTO.name} zaktualizowana!`);
        }
        setIsCategoryPopupOpen(false);
      } catch (error) {
        console.error(
          `Error ${
            action === Action.CREATE ? "creating" : "updating"
          } category:`,
          error
        );
        const errorMessage = extractCategoryErrorMessage(error, action);
        showAlert(errorMessage, AlertType.ERROR);
      }
    },
    [categories, showAlert, handlePopupSuccess]
  );

  const handleProductRemove = useCallback(async () => {
    if (!selectedProduct) return;
    AllProductService.deleteProduct(selectedProduct.id)
      .then(() => {
        handlePopupSuccess(`Produkt ${selectedProduct.name} usunięty!`);
        setIsRemoveProductsPopupOpen(false);
      })
      .catch((error) => {
        console.error("Error removing Product", error);
        showAlert("Błąd usuwania produktu.", AlertType.ERROR);
      });
  }, [showAlert]);

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="dashboard-panel">
      <NavigationBar
        onKeywordChange={handleKeywordChange}
        resetTriggered={resetTriggered}
      >
        <ListActionSection
          onFilter={handleFilterChange}
          filter={filter}
          onReset={handleResetFiltersAndData}
          resetTriggered={resetTriggered}
        />
      </NavigationBar>
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
        <RemovePopup
          onClose={() => setIsRemoveProductsPopupOpen(false)}
          handleRemove={handleProductRemove}
          selectedItem={selectedProduct}
          warningText={
            "❗❗❗ Zatwierdzenie spowoduje usunięcie informacji o produkcie."
          }
          footerText={
            <>
              Jeśli chcesz edytować liczbę produktów w zapasie skorzystaj z
              zakładki - <i>Edytuj Produkt</i>
            </>
          }
        />
      )}
      {isCategoryPopupOpen && (
        <CategoryPopup
          categories={categories}
          onClose={() => setIsCategoryPopupOpen(false)}
          onConfirm={handleCategoryAction}
        />
      )}
    </div>
  );
}

export default Dashboard;
