import React from "react";
import DigitInput from "./DigitInput";
import { useState, useEffect } from "react";
import CategoryButtons from "./CategoryButtons";
import BrandService from "../service/BrandService";
import TextInput from "./TextInput";

const ProductForm = ({
  onForwardProductForm,
  action,
  selectedProduct,
  onForwardBrand,
}) => {
  const [productData, setProductData] = useState({
    id: selectedProduct?.id ?? null,
    name: selectedProduct?.name ?? "",
    categoryId: selectedProduct?.categoryId ?? null,
    brandId: selectedProduct?.brandId ?? null,
    brandName: selectedProduct?.brandName ?? null,
    description: selectedProduct?.description ?? null,
    supply: selectedProduct?.supply ?? 0,
  });
  const [brandSuggestions, setBrandSuggestions] = useState([]);
  const [brandToCreate, setBrandToCreate] = useState(null);

  useEffect(() => {
    if (brandToCreate && brandToCreate?.name.trim().length > 0) {
      const filterDTO = { keyword: brandToCreate.name };
      BrandService.getBrands(filterDTO)
        .then((data) => {
          setBrandSuggestions(data);
        })
        .catch((error) => {
          console.error("Error fetching filtered brands:", error.message);
        });
    }
  }, [brandToCreate?.name]);

  useEffect(() => {
    const productForm = {
      id: productData.id,
      name: productData.name,
      categoryId: productData.categoryId,
      brandId: productData.brandId,
      description: productData.description,
      isDeleted: false,
      supply: productData.supply,
    };
    onForwardProductForm(productForm);
    if (productForm.brandId == null) {
      onForwardBrand(brandToCreate);
    }
  }, [productData]);

  const handleCategory = (id) => {
    setProductData((prev) => ({
      ...prev,
      categoryId: id,
    }));
  };

  const handleProductName = (name) => {
    setProductData((prev) => ({
      ...prev,
      name: name,
    }));
  };

  const handleBrand = (id) => {
    setProductData((prev) => ({
      ...prev,
      brandId: id,
    }));
  };

  const handleSupply = (newSupply) => {
    setProductData((prev) => ({
      ...prev,
      supply: newSupply,
    }));
  };

  const handleDescription = (newDesc) => {
    setProductData((prev) => ({
      ...prev,
      description: newDesc,
    }));
  };

  return (
    <div className={`product-form-container ${action.toLowerCase()}`}>
      <section className="product-form-categories">
        <a className="product-form-input-title">Kategoria:</a>
        <div className="product-form-category-buttons">
          <CategoryButtons
            onSelect={(selectedCategoryId) =>
              handleCategory(selectedCategoryId)
            }
            multiSelect={false}
            selectedId={selectedProduct?.categoryId}
          />
        </div>
      </section>
      <section className="product-form-core-section">
        <ul className="product-form-inputs-section">
          <li className="popup-common-section-row name">
            <a className="product-form-input-title">Nazwa:</a>
            <TextInput
              dropdown={false}
              value={selectedProduct?.name ?? ""}
              onSelect={(inputName) => {
                if (typeof inputName === "string") {
                  handleProductName(inputName);
                }
              }}
            />
          </li>
          <li className="popup-common-section-row">
            <a className="product-form-input-title">Marka Produktu:</a>
            <TextInput
              dropdown={true}
              value={
                selectedProduct
                  ? selectedProduct.brandName
                  : brandToCreate?.name
              }
              displayValue={"name"}
              suggestions={brandSuggestions}
              onSelect={(selected) => {
                if (typeof selected === "string") {
                  if (selected.length > 0) {
                    setBrandToCreate({ name: selected });
                  } else {
                    setBrandToCreate(null);
                  }
                  handleBrand(null);
                } else {
                  handleBrand(selected.id);
                  setBrandToCreate(null);
                }
              }}
            />
          </li>
          <li className="popup-common-section-row">
            <a className="product-form-input-title">Produkty na stanie:</a>
            <DigitInput
              onInputValue={(newSupply) => handleSupply(newSupply)}
              startValue={selectedProduct?.supply ?? 0}
            />
          </li>
          <li className="popup-common-section-row description">
            <a className="product-form-input-title">Dodatkowe informacje:</a>
            <TextInput
              value={selectedProduct?.description ?? ""}
              rows={"4"}
              multiline={true}
              dropdown={false}
              onSelect={(newDesc) => {
                if (typeof newDesc === "string") {
                  handleDescription(newDesc);
                }
              }}
            />
          </li>
        </ul>
      </section>
    </div>
  );
};

export default ProductForm;
