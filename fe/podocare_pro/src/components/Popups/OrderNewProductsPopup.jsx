import React from "react";
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import CustomAlert from "../CustomAlert";
import AllProductService from "../../service/AllProductService";
import ProductActionButton from "../ProductActionButton";
import CategoryButtons from "../CategoryButtons";
import ListHeader from "../ListHeader";
import TextInput from "../TextInput";
import BrandService from "../../service/BrandService";
import DropdownSelect from "../DropdownSelect";
import CategoryService from "../../service/CategoryService";

const OrderNewProductsPopup = ({
  nonExistingProducts,
  orderData,
  onClose,
  onFinalizeOrder,
}) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);

  const [categories, setCategories] = useState([]);
  const [productList, setProductList] = useState([]);
  const [globalCategory, setGlobalCategory] = useState(null);
  const [resetTriggered, setResetTriggered] = useState(false);
  const [productBrandManager, setProductBrandManager] = useState([]);

  const attributes = [
    { name: "", width: "2%", justify: "flex-start" },
    { name: "Nazwa", width: "50%", justify: "flex-start" },
    { name: "Marka", width: "25%", justify: "center" },
    { name: "Kategoria", width: "25%", justify: "center" },
    { name: "", width: "3%", justify: "flex-start" },
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

  const fetchCategories = async () => {
    CategoryService.getCategories()
      .then((data) => {
        setCategories(data);
        return data;
      })
      .catch((error) => {
        setCategories([]);
        console.error("Error fetching categories:", error);
        return [];
      });
  };

  useEffect(() => {
    fetchCategories();
    if (productList.length === 0 && nonExistingProducts.length > 0) {
      const initProducts = nonExistingProducts.map((product) => ({
        id: product.id,
        name: product.productName,
        categoryId: null,
        brandId: null,
        brandName: null,
        description: null,
        supply: 0,
      }));
      setProductList(initProducts);

      const initBrandsManager = nonExistingProducts.map((product) => ({
        productId: product.id,
        brandId: null,
        brandName: "",
        brandSuggestions: [],
      }));
      setProductBrandManager(initBrandsManager);
    }
  }, [nonExistingProducts]);

  const handleSelectCategory = (productId, categoryId) => {
    setProductList((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, categoryId } : product
      )
    );
  };

  const handleGlobalCategoryChange = (categoryId) => {
    setProductList(productList.map((product) => ({ ...product, categoryId })));
    setGlobalCategory(categoryId);
  };

  const handleGlobalCategoryReset = () => {
    setProductList(
      productList.map((product) => ({ ...product, categoryId: null }))
    );
    setGlobalCategory(null);
    setResetTriggered((prev) => !prev);
  };

  const handleBrand = (productId, brandId, brandName) => {
    setProductBrandManager((prev) =>
      prev.map((entry) =>
        entry.productId === productId ? { ...entry, brandName, brandId } : entry
      )
    );

    if (brandName.trim().length > 0) {
      const filterDTO = { keyword: brandName };
      BrandService.getBrands(filterDTO)
        .then((data) => {
          setProductBrandManager((prev) =>
            prev.map((entry) =>
              entry.productId === productId
                ? { ...entry, brandSuggestions: data }
                : entry
            )
          );
        })
        .catch((error) => {
          console.error("Error fetching filtered brands:", error.message);
        });
    }

    setProductList((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, brandId, brandName } : product
      )
    );
  };

  const checkForErrorsBrandsCreate = async (brandsToCreate) => {
    for (const brand of brandsToCreate) {
      if (brand.name.trim() === "") {
        showAlert("Niepoprawna nazwy marki!", "error");
        return true;
      } else if (brand.name.trim().length <= 2) {
        showAlert("Nazwa marki za krótka! (2+)", "error");
        return true;
      }
    }
    return false;
  };

  const checkForErrorsProduct = async (productList) => {
    const missingFields = productList.filter(
      (product) => !product.brandId || !product.categoryId
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

    const productNames = productList.map((product) =>
      product.name.trim().toLowerCase()
    );
    const uniqueProductNames = new Set(productNames);
    if (productNames.length !== uniqueProductNames.size) {
      showAlert("Nazwa produktu musi być unikatowa.", "error");
      return true;
    }

    return false;
  };

  const handleBrandsToCreate = async (brandsToCreate) => {
    if (await checkForErrorsBrandsCreate(brandsToCreate)) return false;

    try {
      const data = await BrandService.createBrands(brandsToCreate);
      return data;
    } catch (error) {
      console.error("Error creating new Brand.", error);
      showAlert("Błąd w trakcie tworzenia produktu.", "error");
      return false;
    }
  };

  const createProductRequestDTOList = (productList) => {
    return productList.map((product) => ({
      id: null,
      name: product.name,
      categoryId: product.categoryId,
      brandId: product.brandId,
      description: product.description,
      supply: product.supply,
    }));
  };

  const createNewProducts = async (productList) => {
    let productsWithUpdatedBrands = [...productList];

    const brandsToCreate = Array.from(
      new Set(
        productBrandManager
          .filter((entry) => entry.brandId == null)
          .map((entry) => entry.brandName.trim())
      )
    ).map((name) => ({ id: null, name }));

    if (brandsToCreate.length > 0) {
      const newBrands = await handleBrandsToCreate(brandsToCreate);
      if (!newBrands) {
        return false;
      }

      productsWithUpdatedBrands = productsWithUpdatedBrands.map((product) => {
        const matchingBrand = newBrands.find(
          (brand) => brand.name === product.brandName
        );
        return matchingBrand
          ? { ...product, brandId: matchingBrand.id }
          : product;
      });
    }

    const productRequestDTOList = createProductRequestDTOList(
      productsWithUpdatedBrands
    );

    if (await checkForErrorsProduct(productRequestDTOList)) {
      return false;
    }

    console.log("req", productRequestDTOList);

    return AllProductService.createNewProducts(productRequestDTOList)
      .then((data) => {
        const updatedOrderProductRequestDTOList = nonExistingProducts.map(
          (product) => {
            const matchingProduct = data.find(
              (newProduct) => newProduct.name === product.productName
            );
            return matchingProduct
              ? { ...product, productId: matchingProduct.id }
              : product;
          }
        );

        const finalOrderProductDTOList = orderData.orderProductDTOList.map(
          (product) => {
            const updatedProduct = updatedOrderProductRequestDTOList.find(
              (op) => op.id === product.id
            );
            return updatedProduct ? updatedProduct : product;
          }
        );

        const finalOrderData = {
          ...orderData,
          orderProductDTOList: finalOrderProductDTOList,
        };
        onFinalizeOrder(finalOrderData);
        return true;
      })
      .catch((error) => {
        console.error("Error creating new Products.", error);
        showAlert("Błąd tworzenia produktu.", "error");
        return false;
      });
  };

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
            <CategoryButtons
              onSelect={(selectedCategoryId) =>
                handleGlobalCategoryChange(selectedCategoryId)
              }
              multiSelect={false}
              resetTriggered={resetTriggered}
            />
            <ProductActionButton
              src={"src/assets/reset.svg"}
              alt={"Reset"}
              text={"Reset"}
              onClick={() => handleGlobalCategoryReset()}
              disableText={true}
            />
          </div>
        </section>
        <ListHeader attributes={attributes} module={"popup"}/>
        <ul className="order-new-products-popup-list">
          {productList.map((product) => (
            <li key={product.id} className="order-new-products-popup-list-item">
              {product.name}
              <section className="order-new-products-popup-input-section">
                <TextInput
                  dropdown={true}
                  value={
                    productBrandManager.find(
                      (entry) => entry.productId === product.id
                    )?.brandName || ""
                  }
                  displayValue={"name"}
                  suggestions={
                    productBrandManager.find(
                      (entry) => entry.productId === product.id
                    )?.brandSuggestions || []
                  }
                  onSelect={(selected) => {
                    if (typeof selected === "string") {
                      handleBrand(product.id, null, selected);
                    } else {
                      handleBrand(product.id, selected.id, selected.name);
                    }
                  }}
                />
                <DropdownSelect
                  items={categories}
                  placeholder="---------"
                  onSelect={(selectedCategory) =>
                    handleSelectCategory(product.id, selectedCategory.id)
                  }
                  selectedItemId={product.categoryId}
                  searchbarVisible={false}
                  addNewVisible={false}
                  showTick={false}
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
            onClick={async () => await createNewProducts(productList)}
          />
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
