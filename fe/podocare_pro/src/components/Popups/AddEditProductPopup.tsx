import { useState, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import ProductForm from "../Products/ProductForm";
import AllProductService from "../../services/AllProductService";
import ActionButton from "../ActionButton";
import BrandService from "../../services/BrandService";
import { Action } from "../../models/action";
import { Product, NewProduct } from "../../models/product";
import { NewBrand } from "../../models/brand";
import { AlertType } from "../../models/alert";
import { validateBrandForm, validateProductForm } from "../../utils/validators";
import { extractProductErrorMessage, extractBrandErrorMessage } from "../../utils/errorHandler";
import { useAlert } from "../Alert/AlertProvider";

export interface AddEditProductPopupProps {
  onClose: () => void;
  onReset: (message: string) => void;
  productId?: number | string | null;
  className?: string;
}

export function AddEditProductPopup ({
  onClose,
  onReset,
  productId,
  className = "",
}: AddEditProductPopupProps) {
  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);
  const [productDTO, setProductDTO] = useState<Product | NewProduct | null>(null);
  const [brandToCreate, setBrandToCreate] = useState<NewBrand | null>(null);
  const { showAlert } = useAlert();

  const action = productId ? Action.EDIT : Action.CREATE;

  const fetchProductById = async (productId: number | string) => {
    AllProductService.getProductById(productId)
      .then((data) => {
        setFetchedProduct(data);
        setProductDTO(data);
      })
      .catch((error) => {
        console.error("Error fetching product by id: ", error);
        showAlert("Błąd!", AlertType.ERROR);
      })
  }

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
      const error = validateProductForm(productToSubmit, fetchedProduct, action);
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
      onClose();
    } catch (error) {
      console.error(`Error ${action === Action.CREATE ? 'creating' : 'updating'} product:`, error);
      const errorMessage = extractProductErrorMessage(error, action);
      showAlert(errorMessage, AlertType.ERROR);
    }
  }, [productDTO, brandToCreate, action, fetchedProduct, onReset, onClose, showAlert, handleBrandToCreate]);

  useEffect(() => {
    if(productId) {
      fetchProductById(productId);
    }
  }, [productId])

  useEffect(() => {
    console.log("fetched", fetchedProduct)
  }, [fetchedProduct])

const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay flex justify-center align-items-start ${className}`} onClick={onClose}>
      <div
        className="product-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2">
          <h2 className="popup-title">
            {action === Action.CREATE ? "Dodaj Nowy Produkt" : "Edytuj Produkt"}
          </h2>
          <button className="popup-close-button transparent border-none flex align-items-center justify-center absolute pointer" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="product-popup-interior width-90 mb-2">
          <ProductForm
            onForwardProductForm={setProductDTO}
            onForwardBrand={setBrandToCreate}
            action={action}
            selectedProduct={fetchedProduct}
          />
        </section>
        <div className="popup-footer-container flex-column justify-end"></div>
        <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={handleProductAction}
        />
        <a className="popup-category-description flex justify-center width-max">
          Jeśli chcesz przypisać produkt do zamówienia skorzystaj z zakładki -{" "}
          <i>Zamówienia</i>
        </a>
      </div>
    </div>,
    portalRoot
  );
};

export default AddEditProductPopup;
