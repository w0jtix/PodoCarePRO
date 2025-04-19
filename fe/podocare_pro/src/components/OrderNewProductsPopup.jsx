import React from "react";
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import CustomAlert from "./CustomAlert";
import BrandInput from "./BrandInput";
import DigitInput from "./DigitInput";
import SelectProductCategory from "./SelectProductCategory";
import OrderListHeader from "./OrderListHeader";
import AllProductService from "../service/AllProductService";
import ProductActionButton from "./ProductActionButton";
import CostInput from "./CostInput";

const OrderNewProductsPopup = ({
  nonExistingProducts,
  orderProductDTOList,
  setOrderProductDTOList,
  trueOrderProductDTOList,
  orderDTO,
  setOrderDTO,
  onClose,
  onFinalizeOrder,
  action,
}) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [adjustedProducts, setAdjustedProducts] = useState([]);
  const [globalCategory, setGlobalCategory] = useState(null);

  const categories = ["Sale", "Tool", "Equipment"];
  const categoryMap = {
    Sale: "Produkty",
    Tool: "Narzędzia",
    Equipment: "Sprzęt",
  };

  const attributes = [
    { name: "", width: "2%", justify: "flex-start" },
    { name: "Nazwa", width: "26.5%", justify: "flex-start" },
    { name: "Marka", width: "24%", justify: "center" },
    { name: "[Msc]*", width: "10%", justify: "center" },
    { name: "Kategoria", width: "21%", justify: "center" },
    { name: "Cena**", width: "17%", justify: "center" },
  ];

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

  const handleSelectCategory = (productId, category) => {
    setAdjustedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, category } : product
      )
    );
  };

  const checkForErrors = () => {
    const missingFields = adjustedProducts.filter(
      (product) => !product.brandName || !product.category
    );

    if (missingFields.length > 0) {
      const missingProductNames = missingFields
        .map((product) => product.name)
        .join(", ");

      showAlert(
        `${missingProductNames} - brak pełnych informacji o produkcie!`,
        "error"
      );
      return true;
    }

    const productNames = adjustedProducts.map((product) =>
      product.name.trim().toLowerCase()
    );
    const uniqueProductNames = new Set(productNames);
    if (productNames.length !== uniqueProductNames.size) {
      showAlert("Nazwa produktu musi być unikatowa.", "error");
      return true;
    }

    if (adjustedProducts.some((product) => product.brandName.trim() === "")) {
      showAlert("Niepoprawna nazwy marki!", "error");
      return true;
    } else if (
      adjustedProducts.some((product) => product.brandName.trim().length <= 2)
    ) {
      showAlert("Nazwa marki za krótka! (2+)", "error");
      return true;
    }

    if (adjustedProducts.some((product) => product.shelfLife === 0)) {
      showAlert("Okres przydatności musi być  > 0!", "error");
      return true;
    }
    return false;
  };

  const createNewProducts = async (adjustedProducts) => {
    if (checkForErrors()) return false;
    return AllProductService.createNewProducts(adjustedProducts)
      .then((data) => {
        if (!data || data.length === 0) {
          showAlert("Błąd tworzenia produktu.", "error");
          return false;
        }
        const updatedOrderProductList = orderProductDTOList.map((product) => {
          const matchingProduct = data.find(
            (newProduct) => newProduct.productName === product.productName
          );
          return matchingProduct
            ? { ...product, productId: matchingProduct.id }
            : product;
        });
        if (action === "Create") {
          setOrderProductDTOList(updatedOrderProductList);
          onFinalizeOrder(updatedOrderProductList);
        } else if (action === "Edit") {
          const updatedTrueOrderProductList = trueOrderProductDTOList.map((product) => {
            const matchingProduct = data.find(
              (newProduct) => newProduct.productName === product.productName
            );
            return matchingProduct
              ? { ...product, productId: matchingProduct.id }
              : product;
          });
          const updatedOrderDTO = {
            ...orderDTO,
            addedOrderProducts: updatedOrderProductList,
            orderProductDTOList: updatedTrueOrderProductList,
          };
          setOrderDTO(updatedOrderDTO);
          onFinalizeOrder(updatedOrderDTO);
        }
        return true;
      })
      .catch((error) => {
        console.error("Error creating new Products.", error);
        showAlert("Błąd tworzenia produktu.", "error");
        return false;
      });
  };

  const handleGlobalCategoryChange = (category) => {
    setAdjustedProducts(
      adjustedProducts.map((product) => ({ ...product, category }))
    );
    setGlobalCategory(category);
  };

  const handleGlobalCategoryReset = () => {
    setAdjustedProducts(
      adjustedProducts.map((product) => ({ ...product, category: null }))
    );
    setGlobalCategory(null);
  };

  const handleBrand = (productId, brandName) => {
    setAdjustedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, brandName } : product
      )
    );
  };

  const handleShelfLife = (productId, shelfLife) => {
    setAdjustedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, shelfLife } : product
      )
    );
  };

  const handleSuggestedSellingPrice = (productId, estimatedSellingPrice) => {
    setAdjustedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, estimatedSellingPrice }
          : product
      )
    );
  };

  useEffect(() => {
    if (adjustedProducts.length === 0 && nonExistingProducts.length > 0) {
      const initProducts = nonExistingProducts.map((product, index) => ({
        id: index,
        name: product.productName,
        category: null,
        brandName: null,
        shelfLife: 24,
        estimatedSellingPrice: 0,
      }));
      setAdjustedProducts(initProducts);
    }
  }, [nonExistingProducts]);

  return ReactDOM.createPortal(
    <div className="add-popup-overlay" onClick={onClose}>
      <div
        className="order-new-products-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="order-new-products-popup-header">
          <div className="order-new-products-popup-title-section">
            <h2 className="popup-title">Nowe Produkty 👀</h2>
          </div>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="order-new-products-popup-action-keys-section">
          <a className="order-new-products-popup-action-keys-title">
            Przypisz dla wszystkich:
          </a>
          <div className="order-new-products-popup-category-buttons">
            {categories.map((category) => (
              <button
                key={category}
                className={`order-new-products-popup-category-button ${category.toLowerCase()} ${
                  globalCategory === category ? "active" : ""
                }`}
                onClick={() => handleGlobalCategoryChange(category)}
              >
                <h2 className="order-new-products-popup-category-button-h2">
                  {categoryMap[category]}
                </h2>
              </button>
            ))}
            <ProductActionButton
              src={"src/assets/reset.svg"}
              alt={"Reset"}
              text={"Reset"}
              onClick={() => handleGlobalCategoryReset()}
              disableText={true}
            />
          </div>
        </section>
        <OrderListHeader attributes={attributes} />
        <ul className="order-new-products-popup-list">
          {adjustedProducts.map((product) => (
            <li key={product.id} className="order-new-products-popup-list-item">
              {product.name}
              <section className="order-new-products-popup-input-section">
                <BrandInput
                  onBrandSelect={(brandName) =>
                    handleBrand(product.id, brandName)
                  }
                />
                <DigitInput
                  onInputValue={(shelfLife) =>
                    handleShelfLife(product.id, shelfLife)
                  }
                  startValue={24}
                  disabled={product.category === "Tool"}
                />

                <SelectProductCategory
                  selectedCategory={product.category}
                  onSelect={(selectedCategory) =>
                    handleSelectCategory(product.id, selectedCategory)
                  }
                />
                <CostInput
                  startValue={0.0}
                  onChange={(price) =>
                    handleSuggestedSellingPrice(product.id, price)
                  }
                  disabled={
                    product.category === "Tool" ||
                    product.category === "Equipment"
                  }
                />
              </section>
            </li>
          ))}
        </ul>
        <div className="popup-footer-container">
          <ProductActionButton
            src={"src/assets/tick.svg"}
            alt={"Zapisz"}
            text={"Zapisz"}
            onClick={async () => await createNewProducts(adjustedProducts)}
          />
        </div>
        <div className="popup-description-display">
          <a className="popup-category-description">
            * Okres przydatności/ długość gwarancji
          </a>
          <a className="popup-category-description">
            ** Szacowana cena sprzedaży
          </a>
        </div>
        {alertVisible && (
          <CustomAlert
            message={errorMessage || successMessage}
            variant={errorMessage ? "error" : "success"}
          />
        )}
      </div>
    </div>,
    document.getElementById("portal-root")
  );
};

export default OrderNewProductsPopup;
