import React from "react";
import TextInput from "./TextInput";
import { useState, useEffect } from "react";
import ColorPicker from "./ColorPicker";
import CategoryButtons from "./CategoryButtons";

const CategoryForm = ({ selectedCategory, onForwardCategoryForm }) => {
  const [categoryData, setCategoryData] = useState({
    id: selectedCategory?.id ?? null,
    name: selectedCategory?.name ?? "",
    color: selectedCategory?.color ?? null,
  });

  useEffect(() => {
    const categoryForm = {
      id: categoryData.id,
      name: categoryData.name,
      color: categoryData.color,
    };
    onForwardCategoryForm(categoryForm);
  }, [categoryData]);

  const handleName = (name) => {
    setCategoryData((prev) => ({
      ...prev,
      name: name,
    }));
  };

  const handleColor = (color) => {
    setCategoryData((prev) => ({
      ...prev,
      color: color,
    }));
  };

  return (
    <div className="form-container">
      <div className="popup-common-section-row name">
        <a className="product-form-input-title">Nazwa:</a>
        <TextInput
          dropdown={false}
          value={selectedCategory?.name ?? ""}
          onSelect={(inputName) => {
            if (typeof inputName === "string") {
              handleName(inputName);
            }
          }}
        />
      </div>
      <div className="popup-common-section-row">
        <a className="product-form-input-title">Kolor:</a>
        <ColorPicker
          onColorSelect={handleColor}
          selectedColor={selectedCategory?.color ?? null}
        />
      </div>
      <div className="popup-common-section-row">
        <CategoryButtons
          multiSelect={false}
          exampleCategoryData={categoryData}
          exampleDisplayMode={true}
        />
      </div>
    </div>
  );
};

export default CategoryForm;
