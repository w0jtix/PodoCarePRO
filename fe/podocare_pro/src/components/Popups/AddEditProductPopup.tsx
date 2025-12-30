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
import { VatRate } from "../../models/vatrate";

export interface AddEditProductPopupProps {
  onClose: () => void;
  onReset: () => void;
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
  const [productDTO, setProductDTO] = useState<NewProduct>({
    name: "",
    category: null,
    brand: null,
    supply: 0,
    sellingPrice: null,
    vatRate: VatRate.VAT_23,
    description: "",
    isDeleted: false,
  });
  const [brandToCreate, setBrandToCreate] = useState<NewBrand | null>(null);
  const { showAlert } = useAlert();

  const action = productId ? Action.EDIT : Action.CREATE;

  useEffect(() => {
    console.log("Product DTO changed: ", productDTO);
  },[productDTO])

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
      if (brandToCreate) {
        const newBrand = await handleBrandToCreate(brandToCreate);
        if (!newBrand) {
          return;
        }
        productDTO.brand = newBrand;
      }
      const error = validateProductForm(productDTO, fetchedProduct, action);
      if (error) {
        showAlert(error, AlertType.ERROR);
        return;
      }

      if (action === Action.CREATE) {
        await AllProductService.createProduct(productDTO as NewProduct);
        showAlert(`Produkt ${productDTO.name} został utworzony!`, AlertType.SUCCESS);
        onReset();
      } else if (action === Action.EDIT && productId && fetchedProduct) {
        await AllProductService.updateProduct(
          productId,
          productDTO as NewProduct
        );
        showAlert(`Produkt ${productDTO.name} został zaktualizowany!`, AlertType.SUCCESS);
        onReset();
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
            brandToCreate={brandToCreate}
            setBrandToCreate={setBrandToCreate}
            action={action}
            productDTO={productDTO}
            setProductDTO = {setProductDTO}
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
