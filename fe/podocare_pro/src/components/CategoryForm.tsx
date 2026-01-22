import React, { useCallback } from "react";
import TextInput from "./TextInput";
import { useState, useEffect } from "react";
import ColorPicker from "./ColorPicker";
import CategoryButtons from "./CategoryButtons";
import { NewProductCategory, ProductCategory, BaseServiceCategory, NewBaseServiceCategory } from "../models/categories";
import { CategoryButtonMode } from "../models/categories";

export interface CategoryFormProps {
  categoryId?: number;
  categoryDTO: ProductCategory | NewProductCategory | BaseServiceCategory | NewBaseServiceCategory;
  setCategoryDTO: React.Dispatch<React.SetStateAction<ProductCategory | NewProductCategory | BaseServiceCategory | NewBaseServiceCategory>>;
}

export function CategoryForm({
  categoryId,
  categoryDTO,
  setCategoryDTO,
}: CategoryFormProps) {


  const handleName = useCallback((name: string): void => {
    setCategoryDTO((prev) => ({
      ...prev,
      name: name,
    }));
  }, []);

  const handleColor = useCallback((color: string): void => {
    setCategoryDTO((prev) => ({
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
          value={categoryDTO.name}
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
          selectedColor={categoryDTO.color}
        />
      </div>
      <div className="popup-common-section-row flex align-items-center space-between g-10px mt-15  cat">
        <CategoryButtons
          categories={[]}
          mode={CategoryButtonMode.PREVIEW}
          exampleCategoryData={categoryDTO}
          onSelect={() => {}}
          resetTriggered={false}
          className="preview"
        />
      </div>
    </div>
  );
}

export default CategoryForm;
