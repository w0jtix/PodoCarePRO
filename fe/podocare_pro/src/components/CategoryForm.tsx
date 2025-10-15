import React, { useCallback } from "react";
import TextInput from "./TextInput";
import { useState, useEffect } from "react";
import ColorPicker from "./ColorPicker";
import CategoryButtons from "./CategoryButtons";
import { NewProductCategory, ProductCategory } from "../models/categories";
import { CategoryButtonMode } from "../models/categories";

export interface CategoryFormProps {
  selectedCategory?: ProductCategory;
  onForwardCategoryForm: (
    categoryData: ProductCategory | NewProductCategory
  ) => void;
}

export function CategoryForm({
  selectedCategory,
  onForwardCategoryForm,
}: CategoryFormProps) {
  const getInitialData = (): ProductCategory | NewProductCategory => {
    if (selectedCategory) {
      return {
        id: selectedCategory.id,
        name: selectedCategory.name,
        color: selectedCategory.color,
      };
    }
    return {
      name: "",
      color: "255, 255, 255",
    };
  };
  const [categoryData, setCategoryData] = useState<
    ProductCategory | NewProductCategory
  >(getInitialData);

  useEffect(() => {
    onForwardCategoryForm(categoryData);
  }, [categoryData, onForwardCategoryForm]);

  const handleName = useCallback((name: string): void => {
    setCategoryData((prev) => ({
      ...prev,
      name: name,
    }));
  }, []);

  const handleColor = useCallback((color: string): void => {
    setCategoryData((prev) => ({
      ...prev,
      color: color,
    }));
  }, []);

  return (
    <div className="form-container align-self-center width-65">
      <div className="popup-common-section-row flex align-items-center space-between g-10px mt-15 name">
        <a className="product-form-input-title">Nazwa:</a>
        <TextInput
          dropdown={false}
          value={categoryData.name}
          onSelect={(inputName) => {
            if (typeof inputName === "string") {
              handleName(inputName);
            }
          }}
        />
      </div>
      <div className="popup-common-section-row flex align-items-center space-between g-10px mt-15 ">
        <a className="product-form-input-title">Kolor:</a>
        <ColorPicker
          onColorSelect={handleColor}
          selectedColor={categoryData.color}
        />
      </div>
      <div className="popup-common-section-row flex align-items-center space-between g-10px mt-15  cat">
        <CategoryButtons
          categories={[]}
          mode={CategoryButtonMode.PREVIEW}
          exampleCategoryData={categoryData}
          onSelect={() => {}}
          resetTriggered={false}
          className="preview"
        />
      </div>
    </div>
  );
}

export default CategoryForm;
