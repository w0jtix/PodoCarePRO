import React from "react";
import DigitInput from "../DigitInput";
import { useState, useEffect, useCallback } from "react";
import CategoryButtons from "../CategoryButtons";
import BrandService from "../../services/BrandService";
import TextInput from "../TextInput";
import { Product, NewProduct } from "../../models/product";
import { Action } from "../../models/action";
import { Brand, KeywordDTO, NewBrand } from "../../models/brand";
import { CategoryButtonMode, ProductCategory } from "../../models/product-category";
import {
  convertToBackendData,
  convertToWorkingData,
  createNewProductWorkingData,
  ProductWorkingData,
} from "../../models/working-data";

export interface ProductFormProps {
  onForwardProductForm: (product: Product | NewProduct) => void;
  action: Action;
  selectedProduct?: Product | null;
  onForwardBrand: (brand: NewBrand | null) => void;
  className?: string;
}

export function ProductForm({
  onForwardProductForm,
  action,
  selectedProduct,
  className = "",
  onForwardBrand,
}: ProductFormProps) {
  const [productWorkingData, setProductWorkingData] =
    useState<ProductWorkingData>(() => {
      if (selectedProduct) {
        return convertToWorkingData.product(selectedProduct);
      }
      return createNewProductWorkingData();
    });
  /* const [brandSuggestions, setBrandSuggestions] = useState<Brand[]>([]);
  const [brandToCreate, setBrandToCreate] = useState<NewBrand | null>(null); */

  const isExistingBrand = (brand: Brand | NewBrand | null): brand is Brand => {
    return brand !== null && "id" in brand && typeof brand.id === "number";
  };

  useEffect(() => {
    if (productWorkingData.brandName.trim().length > 0) {
      const keywordFilter: KeywordDTO = {
        keyword: productWorkingData.brandName.trim(),
      };
      BrandService.getBrands(keywordFilter)
        .then((data) => {
          setProductWorkingData((prev) => ({
            ...prev,
            brandSuggestions: data,
          }));
        })
        .catch((error) => {
          console.error("Error fetching filtered brands:", error.message);
          setProductWorkingData((prev) => ({
            ...prev,
            brandSuggestions: [],
          }));
        });
    } else {
      setProductWorkingData((prev) => ({
        ...prev,
        brandSuggestions: [],
      }));
    }
  }, [productWorkingData.brandName]);

  useEffect(() => {
    const backendProduct = convertToBackendData.product(productWorkingData);
    onForwardProductForm(backendProduct);

    if (
      productWorkingData.brandName.trim().length > 0 &&
      !isExistingBrand(productWorkingData.brand)
    ) {
      const newBrand: NewBrand = { name: productWorkingData.brandName.trim() };
      onForwardBrand(newBrand);
    } else {
      onForwardBrand(null);
    }
  }, [productWorkingData]);

  const handleCategory = useCallback((categories: ProductCategory[] | null) => {
    setProductWorkingData((prev) => ({
      ...prev,
      category: categories ? categories[0] : null,
    }));
  }, []);

  const handleProductName = useCallback((name: string) => {
    setProductWorkingData((prev) => ({
      ...prev,
      name: name,
    }));
  }, []);

  /*   const handleBrand = useCallback((brand: Brand | null) => {
    setProductWorkingData((prev) => ({
      ...prev,
      brand: brand ?? null,
    }));
  }, []); */

  const handleSupply = useCallback((newSupply: number | null) => {
    setProductWorkingData((prev) => ({
      ...prev,
      supply: newSupply ?? 0,
    }));
  }, []);

  const handleDescription = useCallback((newDesc: string) => {
    setProductWorkingData((prev) => ({
      ...prev,
      description: newDesc,
    }));
  }, []);

  const handleBrandSelection = useCallback((selected: string | Brand) => {
    setProductWorkingData((prev) => {
      if (typeof selected === "string") {
        return {
          ...prev,
          brand: null,
          brandName: selected,
        };
      } else {
        return {
          ...prev,
          brand: selected,
          brandName: selected.name,
        };
      }
    });
  }, []);

  const getProductName = (): string => {
    return productWorkingData.name || "";
  };

  const getBrandName = (): string => {
    if (productWorkingData.brand?.name) {
      return productWorkingData.brand.name;
    }
    return productWorkingData.brandName;
  };

  const getDescription = (): string => {
    return productWorkingData.description || "";
  };

  const getSupply = (): number => {
    return productWorkingData.supply || 0;
  };

  return (
    <div
      className={`product-form-container ${action
        .toString()
        .toLowerCase()} ${className}`}
    >
      <section className="product-form-categories">
        <a className="product-form-input-title">Kategoria:</a>
        <div className="product-form-category-buttons">
          <CategoryButtons
            onSelect={handleCategory}
            mode={CategoryButtonMode.SELECT}
            selectedCategories={
              productWorkingData.category ? [productWorkingData.category] : []
            }
          />
        </div>
      </section>
      <section className="product-form-core-section">
        <ul className="product-form-inputs-section">
          <li className="popup-common-section-row name">
            <a className="product-form-input-title">Nazwa:</a>
            <TextInput
              dropdown={false}
              value={getProductName()}
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
              value={getBrandName()}
              suggestions={productWorkingData.brandSuggestions}
              onSelect={handleBrandSelection}
            />
          </li>
          <li className="popup-common-section-row">
            <a className="product-form-input-title">Produkty na stanie:</a>
            <DigitInput onChange={handleSupply} value={getSupply()} />
          </li>
          <li className="popup-common-section-row description">
            <a className="product-form-input-title">Dodatkowe informacje:</a>
            <TextInput
              value={getDescription()}
              rows={4}
              multiline={true}
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
}

export default ProductForm;
