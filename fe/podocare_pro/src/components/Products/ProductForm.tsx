import React from "react";
import DigitInput from "../DigitInput";
import CostInput from "../CostInput";
import { useState, useEffect, useCallback } from "react";
import CategoryButtons from "../CategoryButtons";
import BrandService from "../../services/BrandService";
import TextInput from "../TextInput";
import { Product, NewProduct, Unit } from "../../models/product";
import { Action } from "../../models/action";
import { Brand, KeywordDTO, NewBrand } from "../../models/brand";
import { CategoryButtonMode, ProductCategory } from "../../models/categories";
import CategoryService from "../../services/CategoryService";
import SelectVATButton from "../SelectVATButton";
import { VatRate } from "../../models/vatrate";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import ActionButton from "../ActionButton";

export interface ProductFormProps {
  action: Action;
  brandToCreate: NewBrand | null;
  setBrandToCreate: React.Dispatch<React.SetStateAction<NewBrand | null>>;
  className?: string;
  productDTO: NewProduct;
  setProductDTO: React.Dispatch<React.SetStateAction<NewProduct>>;
}

export function ProductForm({
  action,
  className = "",
  brandToCreate,
  setBrandToCreate,
  productDTO,
  setProductDTO,
}: ProductFormProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const { showAlert } = useAlert();
  const [brandSuggestions, setBrandSuggestions] = useState<Brand[]>([]);

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

  const handleCategory = useCallback((categories: ProductCategory[] | null) => {
    setProductDTO((prev) => {
      const newCategory = categories ? categories[0] : null;
      const isProductCategory = newCategory?.name === "Produkty";

      return {
        ...prev,
        category: newCategory,
        sellingPrice: isProductCategory ? prev.sellingPrice : null,
        volume: isProductCategory ? prev.volume : null,
        unit: isProductCategory ? prev.unit : null,
        vatRate: isProductCategory ? prev.vatRate : VatRate.VAT_23,
      };
    });
  }, []);
  const handleProductName = useCallback((name: string) => {
    setProductDTO((prev) => ({
      ...prev,
      name: name,
    }));
  }, []);
  const handleSupply = useCallback((newSupply: number | null) => {
    setProductDTO((prev) => ({
      ...prev,
      supply: newSupply ?? 0,
    }));
  }, []);
  const handleSellingPrice = useCallback((newSellingPrice: number | null) => {
    setProductDTO((prev) => ({
      ...prev,
      sellingPrice: newSellingPrice ?? 0,
    }));
  }, []);
  const handleVolume = useCallback((newVolume: number | null) => {
    setProductDTO((prev) => ({
      ...prev,
      volume: newVolume ?? 0,
    }));
  }, []);
  const handleVatSelect = useCallback((selectedVat: VatRate) => {
    setProductDTO((prev) => ({
      ...prev,
      vatRate: selectedVat ?? VatRate.VAT_23,
    }))
  },[])
  const handleDescription = useCallback((newDesc: string) => {
    setProductDTO((prev) => ({
      ...prev,
      description: newDesc,
    }));
  }, []);

  const handleBrandNameChange = useCallback(async (selected: string | Brand) => {
      if (typeof selected === "string") {
        const filter: KeywordDTO = { keyword: selected };
        let suggestions: Brand[] = [];

        if (selected.trim().length > 0) {
        try {
          suggestions = await BrandService.getBrands(filter);
        } catch (error) {
          showAlert("Błąd", AlertType.ERROR);
          console.error("Error fetching filtered products:", error);
        }
      }
      const exactMatch = suggestions.find(p => p.name === selected);

      if(exactMatch) {
        setProductDTO((prev) => ({
          ...prev,
          brand: exactMatch,
        }))
        setBrandToCreate(null);
      } else {
        setBrandToCreate( {
          name: selected,
        })
        setProductDTO((prev) => ({
          ...prev,
          brand: null,
        }))
      }
      setBrandSuggestions(exactMatch ? []: suggestions);
      } else {
        setProductDTO((prev) => ({
          ...prev,
          brand: selected,
        }))
        setBrandToCreate(null);
        setBrandSuggestions([]);
      }

  }, [showAlert]);

  const handleMlUnit = useCallback(() => {
    setProductDTO((prev) => ({
      ...prev,
      unit: prev.unit === Unit.ML ? null : Unit.ML,
    }));
  }, []);

  const handleGUnit = useCallback(() => {
    setProductDTO((prev) => ({
      ...prev,
      unit: prev.unit === Unit.G ? null : Unit.G,
    }));
  }, []);

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
            selectedCategories={ productDTO.category ? [productDTO.category] : [] }
          />
        </div>
      </section>
      <section className="product-form-core-section flex">
        <ul className="product-form-inputs-section width-95 flex-column p-0 mt-0 mb-0">
          <li className="popup-common-section-row flex align-items-center space-between g-10px mt-15  name">
            <a className="product-form-input-title">Nazwa:</a>
            <TextInput
              dropdown={false}
              value={productDTO.name}
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
              key={`brand-input-${productDTO.brand && 'id' in productDTO.brand ? productDTO.brand.id : 'new'}`}
              dropdown={true}
              value={brandToCreate?.name ?? productDTO.brand?.name ?? ""}
              suggestions={brandSuggestions}
              onSelect={handleBrandNameChange}
            />
          </li>
          <li className="popup-common-section-row flex align-items-center space-between g-10px mt-15 ">
            <a className="product-form-input-title">Produkty na stanie:</a>
            <DigitInput onChange={handleSupply} value={productDTO.supply} />
          </li>
          {productDTO.category?.name === "Produkty" && (
              <>
              <li className="popup-common-section-row flex align-items-center space-between g-10px mt-15 ">
                <a className="product-form-input-title">Cena sprzedaży:</a>               
                <CostInput
                  onChange={handleSellingPrice}
                  selectedCost={productDTO.sellingPrice ?? 0}
                />
              </li>
              <li className="popup-common-section-row flex align-items-center space-between g-10px mt-15 ">
                <a className="product-form-input-title">VAT sprzedaży:</a>
                <SelectVATButton
                  selectedVat={productDTO.vatRate ?? VatRate.VAT_23}
                  onSelect={handleVatSelect}
                  className="product-form"
                />
              </li>
              <li className="popup-common-section-row flex align-items-center space-between g-10px mt-15 ">
                <a className="product-form-input-title">Objętość produktu [ml/g]:</a>
                <div className="flex g-5px">
                  <CostInput
                    onChange={handleVolume}
                    selectedCost={productDTO.volume ?? 0}
                  />
                  <ActionButton
                    disableImg ={true}
                    text={"ml"}
                    onClick={handleMlUnit}
                    className={`unit-b ${productDTO.unit === Unit.ML ? "active-g" : ""}`}
                  />
                  <ActionButton
                    disableImg ={true}
                    text={"g"}
                    onClick={handleGUnit}
                    className={`unit-b ${productDTO.unit === Unit.G ? "active-y" : ""}`}
                  />
                </div>
              </li>
              </>
            )}
          <li className="popup-common-section-row space-between g-10px description flex-column align-items-start mt-15">
            <a className="product-form-input-title">Dodatkowe informacje:</a>
            <TextInput
              value={productDTO.description ?? ""}
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
