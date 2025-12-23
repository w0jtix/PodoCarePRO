import React from "react";
import DigitInput from "../DigitInput";
import CostInput from "../CostInput";
import { useState, useEffect, useCallback } from "react";
import CategoryButtons from "../CategoryButtons";
import BrandService from "../../services/BrandService";
import TextInput from "../TextInput";
import { Product, NewProduct } from "../../models/product";
import { Action } from "../../models/action";
import { Brand, KeywordDTO, NewBrand } from "../../models/brand";
import { CategoryButtonMode, ProductCategory } from "../../models/categories";
import {
  convertToBackendData,
  convertToWorkingData,
  createNewProductWorkingData,
  ProductWorkingData,
} from "../../models/working-data";
import CategoryService from "../../services/CategoryService";
import SelectVATButton from "../SelectVATButton";
import { VatRate } from "../../models/vatrate";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";

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
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productWorkingData, setProductWorkingData] =
    useState<ProductWorkingData>(() => {
      if (selectedProduct) {
        return convertToWorkingData.product(selectedProduct);
      }
      return createNewProductWorkingData();
    });
  const { showAlert } = useAlert();
  const isExistingBrand = (brand: Brand | NewBrand | null): brand is Brand => {
    return brand !== null && "id" in brand && typeof brand.id === "number";
  };

  const fetchCategories = async (): Promise<void> => {
    CategoryService.getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        setCategories([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching categories:", error);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setProductWorkingData(convertToWorkingData.product(selectedProduct));
    }
  }, [selectedProduct]);

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
          showAlert("Błąd", AlertType.ERROR);
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

  const handleSupply = useCallback((newSupply: number | null) => {
    setProductWorkingData((prev) => ({
      ...prev,
      supply: newSupply ?? 0,
    }));
  }, []);

  const handleSellingPrice = useCallback((newSellingPrice: number | null) => {
    setProductWorkingData((prev) => ({
      ...prev,
      sellingPrice: newSellingPrice ?? 0,
    }));
  }, []);

  const handleVatSelect = useCallback((selectedVat: VatRate) => {
    setProductWorkingData((prev) => ({
      ...prev,
      vatRate: selectedVat ?? VatRate.VAT_23,
    }))
  },[])

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

  const getSellingPrice = (): number => {
    return productWorkingData.sellingPrice || 0;
  };

  const getVatRate = (): VatRate => {
    return productWorkingData.vatRate || VatRate.VAT_23;
  }

  return (
    <div
      className={`product-form-container flex-column ${action
        .toString()
        .toLowerCase()} ${className}`}
    >
      <section className="product-form-categories flex align-items-center mb-3 g-4">
        <a className="product-form-input-title">Kategoria:</a>
        <div className="product-form-category-buttons flex g-15px justify-center align-items-center">
          <CategoryButtons
            categories={categories}
            onSelect={handleCategory}
            mode={CategoryButtonMode.SELECT}
            selectedCategories={
              productWorkingData.category ? [productWorkingData.category] : []
            }
          />
        </div>
      </section>
      <section className="product-form-core-section flex">
        <ul className="product-form-inputs-section width-95 flex-column p-0 mt-0 mb-0">
          <li className="popup-common-section-row flex align-items-center space-between g-10px mt-15  name">
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
          <li className="popup-common-section-row flex align-items-center space-between g-10px mt-15 ">
            <a className="product-form-input-title">Marka Produktu:</a>
            <TextInput
              dropdown={true}
              value={getBrandName()}
              suggestions={productWorkingData.brandSuggestions}
              onSelect={handleBrandSelection}
            />
          </li>
          <li className="popup-common-section-row flex align-items-center space-between g-10px mt-15 ">
            <a className="product-form-input-title">Produkty na stanie:</a>
            <DigitInput onChange={handleSupply} value={getSupply()} />
          </li>
          {productWorkingData &&
            productWorkingData.category?.name === "Produkty" && (
              <>
              <li className="popup-common-section-row flex align-items-center space-between g-10px mt-15 ">
                <a className="product-form-input-title">Cena sprzedaży:</a>
                <CostInput
                  onChange={handleSellingPrice}
                  selectedCost={getSellingPrice()}
                />
              </li>
              <li className="popup-common-section-row flex align-items-center space-between g-10px mt-15 ">
                <a className="product-form-input-title">VAT sprzedaży:</a>
                <SelectVATButton
                  selectedVat={getVatRate()}
                  onSelect={handleVatSelect}
                  className="product-form"
                />
              </li>
              </>
            )}
          <li className="popup-common-section-row space-between g-10px description flex-column align-items-start mt-15">
            <a className="product-form-input-title">Dodatkowe informacje:</a>
            <TextInput
              value={getDescription()}
              rows={8}
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
