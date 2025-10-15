import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import { useState } from "react";
import CategoryForm from "../CategoryForm";
import { BaseServiceCategory, NewBaseServiceCategory, NewProductCategory, ProductCategory } from "../../models/categories";

export interface CategoryPopupProps {
  categories: ProductCategory[] | BaseServiceCategory[];
  onClose: () => void;
  onConfirm: (category: ProductCategory | NewProductCategory | BaseServiceCategory | NewBaseServiceCategory) => void;
  selectedCategory?: ProductCategory | BaseServiceCategory;
  className?: string;
}

export function CategoryPopup({
  categories,
  onClose,
  onConfirm,
  selectedCategory,
  className = "",
}: CategoryPopupProps) {
  const [categoryDTO, setCategoryDTO] = useState<
    ProductCategory | NewProductCategory | BaseServiceCategory | NewBaseServiceCategory | null
  >(null);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay flex justify-center align-items-start short-version category ${className}`}
      onClick={onClose}
    >
      <div
        className="category-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2 category">
          <h2 className="popup-title">
            {selectedCategory ? "Edytuj Kategorię" : "Nowa Kategoria"}
          </h2>
          <button className="popup-close-button  transparent border-none flex align-items-center justify-center absolute pointer" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="create-category-popup width-max flex justify-center">
          <CategoryForm
            onForwardCategoryForm={setCategoryDTO}
            selectedCategory={selectedCategory}
          />
        </section>
        <section className="footer-popup-action-buttons width-60 flex space-between mb-05">
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
              onClick={() => categoryDTO && onConfirm(categoryDTO)}
            />
          </div>
        </section>
      </div>
    </div>,
    portalRoot
  );
}

export default CategoryPopup;
