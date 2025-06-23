import React from "react";
import { useState, useCallback, useEffect } from "react";
import CustomAlert from "../CustomAlert";
import ReactDOM from "react-dom";
import ProductForm from "../Products/ProductForm";
import AllProductService from "../../services/AllProductService";
import ActionButton from "../ActionButton";
import BrandService from "../../services/BrandService";
import { Action } from "../../models/action";
import { Product, NewProduct } from "../../models/product";
import { NewBrand } from "../../models/brand";
import { Alert, AlertType } from "../../models/alert";
import { validateBrandForm, validateProductForm } from "../../utils/validators";
import { extractProductErrorMessage, extractBrandErrorMessage } from "../../utils/errorHandler";

export interface AddEditProductPopupProps {
  onClose: () => void;
  onReset: (message: string) => void;
  selectedProduct?: Product | null;
  className?: string;
}

export function AddEditProductPopup ({
  onClose,
  onReset,
  selectedProduct,
  className = "",
}: AddEditProductPopupProps) {

  const [productDTO, setProductDTO] = useState<Product | NewProduct | null>(null);
  const [brandToCreate, setBrandToCreate] = useState<NewBrand | null>(null);
  const [alert, setAlert] = useState<Alert| null>(null);

  const action = selectedProduct ? Action.EDIT : Action.CREATE;
  
  const showAlert = useCallback((message: string, variant: AlertType) => {
    setAlert({ message, variant });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  }, []);

  const handleBrandToCreate = useCallback(async (brandToCreate: NewBrand) => {
    const error = validateBrandForm(brandToCreate, undefined, Action.CREATE);
    if(error) {
      showAlert(error, AlertType.ERROR);
      return null;
    }
    try {
      const newBrand  = await BrandService.createBrand(brandToCreate);
      return newBrand;
    } catch (error) {
      console.error("Error creating new Brand.", error);
      const errorMessage = extractBrandErrorMessage(error, action);
      showAlert(errorMessage, AlertType.ERROR);
      return null;
    }
  }, [showAlert]);

  const handleProductAction = useCallback(async () => {
    if (!productDTO) return;
    
    try {
      let productToSubmit = { ...productDTO };

      if (brandToCreate) {
        const newBrand = await handleBrandToCreate(brandToCreate);
        if (!newBrand) {
          return;
        }
        productToSubmit.brand = newBrand;
      }
      const error = validateProductForm(productToSubmit, selectedProduct, action);
      if (error) {
        showAlert(error, AlertType.ERROR);
        return;
      }

      if (action === Action.CREATE) {
        await AllProductService.createProduct(productToSubmit as NewProduct);
        onReset(`Produkt ${productToSubmit.name} został utworzony!`);
      } else if (action === Action.EDIT && 'id' in productToSubmit && productToSubmit.id) {
        await AllProductService.updateProduct(
          productToSubmit.id,
          productToSubmit as Product
        );
        onReset(`Produkt ${productToSubmit.name} został zaktualizowany!`);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error) {
      console.error(`Error ${action === Action.CREATE ? 'creating' : 'updating'} product:`, error);
      const errorMessage = extractProductErrorMessage(error, action);
      showAlert(errorMessage, AlertType.ERROR);
    }
  }, [productDTO, brandToCreate, action, selectedProduct, onReset, onClose, showAlert, handleBrandToCreate]);

const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay ${className}`} onClick={onClose}>
      <div
        className="product-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header">
          <h2 className="popup-title">
            {action === Action.CREATE ? "Dodaj Nowy Produkt" : "Edytuj Produkt"}
          </h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="product-popup-interior">
          <ProductForm
            onForwardProductForm={setProductDTO}
            onForwardBrand={setBrandToCreate}
            action={action}
            selectedProduct={selectedProduct}
          />
        </section>
        <div className="popup-footer-container"></div>
        <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={handleProductAction}
        />
        <a className="popup-category-description">
          Jeśli chcesz przypisać produkt do zamówienia skorzystaj z zakładki -{" "}
          <i>Zamówienia</i>
        </a>
        {alert && (
          <CustomAlert
            message={alert.message}
            variant={alert.variant}
          />
        )}
      </div>
    </div>,
    portalRoot
  );
};

export default AddEditProductPopup;
