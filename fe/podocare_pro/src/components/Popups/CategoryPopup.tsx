import React from "react";
import CustomAlert from "../CustomAlert";
import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import { useState, useEffect, useCallback } from "react";
import CategoryService from "../../services/CategoryService";
import CategoryForm from "../CategoryForm";
import { Alert, AlertType } from "../../models/alert";
import {
  NewProductCategory,
  ProductCategory,
} from "../../models/product-category";
import { Action } from "../../models/action";
import { validateProductCategoryForm } from "../../utils/validators";
import { extractCategoryErrorMessage } from "../../utils/errorHandler";

export interface CategoryPopupProps {
  onClose: () => void;
  onReset: (message: string) => void;
  selectedCategory?: ProductCategory;
  className?: string;
}

export function CategoryPopup({
  onClose,
  onReset,
  selectedCategory,
  className = "",
}: CategoryPopupProps) {
  const [categoryDTO, setCategoryDTO] = useState<
    ProductCategory | NewProductCategory | null
  >(null);
  const [fetchedCategories, setFetchedCategories] = useState<ProductCategory[]>(
    []
  );
  const [alert, setAlert] = useState<Alert | null>(null);

  const action = selectedCategory ? Action.EDIT : Action.CREATE;

  const showAlert = useCallback((message: string, variant: AlertType) => {
    setAlert({ message, variant });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  }, []);

  const fetchCategories = useCallback(async () => {
    CategoryService.getCategories()
      .then((data) => {
        setFetchedCategories(data);
      })
      .catch((error) => {
        setFetchedCategories([]);
        console.error("Error fetching categories:", error);
      });
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryAction = useCallback(async () => {
    if (!categoryDTO) return;

    const error = validateProductCategoryForm(
      categoryDTO,
      selectedCategory,
      action,
      fetchedCategories
    );
    if (error) {
      showAlert(error, AlertType.ERROR);
      return;
    }
    try {
      if (action === Action.CREATE) {
        await CategoryService.createCategory(categoryDTO as NewProductCategory);
        onReset(`Kategoria ${categoryDTO.name} utworzona!`);
      } else if (action === Action.EDIT && "id" in categoryDTO) {
        await CategoryService.updateCategory(
          categoryDTO.id,
          categoryDTO as ProductCategory
        );
        onReset(`Kategoria ${categoryDTO.name} zaktualizowana!`);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error) {
      console.error(
        `Error ${action === Action.CREATE ? "creating" : "updating"} category:`,
        error
      );
      const errorMessage = extractCategoryErrorMessage(error, action);
      showAlert(errorMessage, AlertType.ERROR);
    }
  }, [categoryDTO, action, selectedCategory]);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay short-version category ${className}`}
      onClick={onClose}
    >
      <div
        className="category-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header">
          <h2 className="popup-title">
            {selectedCategory ? "Edytuj Kategorię" : "Nowa Kategoria"}
          </h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="remove-product-popup-interior">
          <CategoryForm
            onForwardCategoryForm={setCategoryDTO}
            selectedCategory={selectedCategory}
          />
        </section>
        <section className="footer-popup-action-buttons">
          <div className="footer-cancel-button">
            <ActionButton
              src={"src/assets/cancel.svg"}
              alt={"Anuluj"}
              text={"Anuluj"}
              onClick={onClose}
            />
          </div>
          <div className="footer-confirm-button">
            <ActionButton
              src={"src/assets/tick.svg"}
              alt={"Zatwierdź"}
              text={"Zatwierdź"}
              onClick={handleCategoryAction}
            />
          </div>
        </section>
        {alert && (
          <CustomAlert message={alert.message} variant={alert.variant} />
        )}
      </div>
    </div>,
    portalRoot
  );
}

export default CategoryPopup;
