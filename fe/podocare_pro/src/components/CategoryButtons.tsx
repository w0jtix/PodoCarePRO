import React from "react";
import { useState, useEffect } from "react";
import {
  ProductCategory,
  CategoryButtonMode,
  NewProductCategory,
  BaseServiceCategory,
  NewBaseServiceCategory,
} from "../models/categories";

const EMPTY_SELECTED_CATEGORIES: ProductCategory[] = [];

export interface CategoryButtonsProps {
  categories: ProductCategory[] | NewProductCategory[] | BaseServiceCategory[] | NewBaseServiceCategory[];
  onSelect: (selected: ProductCategory[] | BaseServiceCategory[] | null) => void;
  resetTriggered?: boolean;
  mode?: CategoryButtonMode;
  selectedCategories?: ProductCategory[] | BaseServiceCategory[];
  exampleCategoryData?: ProductCategory | NewProductCategory | BaseServiceCategory | NewBaseServiceCategory;
  className?:string;
}

export function CategoryButtons({
  categories,
  onSelect,
  resetTriggered,
  mode = CategoryButtonMode.MULTISELECT,
  selectedCategories = EMPTY_SELECTED_CATEGORIES,
  exampleCategoryData,
  className=""
}: CategoryButtonsProps) {
  const [selectedCategoryList, setSelectedCategoryList] =
    useState<ProductCategory[] | BaseServiceCategory[]>(selectedCategories);

  const isPreviewMode = mode === CategoryButtonMode.PREVIEW;
  const isMultiSelect = mode === CategoryButtonMode.MULTISELECT;

  useEffect(() => {
    if (resetTriggered) {
      setSelectedCategoryList([]);
    }
  }, [resetTriggered]);

  useEffect(() => {
    setSelectedCategoryList(selectedCategories);
  }, [selectedCategories]);

  const isSingleRow = categories.length < 4;

  const getButtonStyle = (
  color: string,
  isActive: boolean
): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    border: `1px solid rgba(${color}, 0.5)`,
    boxShadow: `inset 0 0 65px rgba(${color}, ${isActive ? 0.9 : 0.2})`,
    color: "#000",
    borderRadius: "8px",
    justifyContent: "center",
    alignItems: "center",
    cursor: isPreviewMode ? "default" : "pointer",
    transition: "all 0.1s ease",
  };

  if (isPreviewMode) {
    return {
      ...baseStyle,
      minWidth: "105px",
      width: "fit-content",
      maxWidth: "100%",
      height: "35px",
      padding: "0 12px",
    };
  }

  return {
    ...baseStyle,
    width: isSingleRow ? "75px" : "75px",
    height: isSingleRow ? "28px" : "25px",
  };
};

  const toggleCategory = (category: ProductCategory | BaseServiceCategory) => {
    if (isPreviewMode) return;

    const isAlreadySelected = selectedCategoryList.some((cat) => cat.id === category.id);
    const newList = isMultiSelect
      ? (isAlreadySelected
          ? selectedCategoryList.filter((cat) => cat.id !== category.id)
          : [...selectedCategoryList, category])
      : (isAlreadySelected ? [] : [category]);

    setSelectedCategoryList(newList);
    onSelect(newList);
  };

  const isCategorySelected = (category: ProductCategory | BaseServiceCategory): boolean => {
    if (isPreviewMode) return false;
    return selectedCategoryList.some((cat) => cat.id === category.id);
  };

    const cat = isPreviewMode && exampleCategoryData ? [exampleCategoryData] : categories;

  return (
    <div className={`category-buttons ${className} grid g-10px`}>
      {cat.map((category, index) => {
        const isNewCategory = isPreviewMode;
        const isActive = !isNewCategory && isCategorySelected(category as ProductCategory | BaseServiceCategory);

        return (
          <button
          key={("id" in category && category.id ? category.id : index) as string | number}
          style={getButtonStyle(category.color, isActive)}
          className={`category-button ${isActive ? "active" : ""} ${className}`}
          onClick={() => {
            if (!isPreviewMode) {
              toggleCategory(category as ProductCategory | BaseServiceCategory);
            }
          }}
        >
            <h2
              className="category-button-h2"
              style={{
                fontFamily: "var(--font-h2-outfit)",
                fontSize: isPreviewMode
                  ? "16px"
                  : isSingleRow
                  ? "var(--font-size-mid-button)"
                  : "var(--font-size-small-button)",
                fontWeight: "var(--font-weight-button)",
                letterSpacing: "0.85px",
              }}
            >
              {category.name}
            </h2>
          </button>
        );
      })}
    </div>
  );
}

export default CategoryButtons;
