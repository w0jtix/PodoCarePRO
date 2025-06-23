import React from "react";
import { useState, useEffect } from "react";
import {
  ProductCategory,
  CategoryButtonMode,
  NewProductCategory,
} from "../models/product-category";
import CategoryService from "../services/CategoryService";

export interface CategoryButtonsProps {
  onSelect: (selected: ProductCategory[] | null) => void;
  resetTriggered?: boolean;
  mode?: CategoryButtonMode;
  selectedCategories?: ProductCategory[];
  exampleCategoryData?: ProductCategory | NewProductCategory;
}

export function CategoryButtons({
  onSelect,
  resetTriggered,
  mode = CategoryButtonMode.MULTISELECT,
  selectedCategories = [],
  exampleCategoryData,
}: CategoryButtonsProps) {
  const [selectedCategoryList, setSelectedCategoryList] =
    useState<ProductCategory[]>(selectedCategories);
  const [categories, setCategories] = useState<
    ProductCategory[] | NewProductCategory[]
  >([]);
  const isPreviewMode = mode === CategoryButtonMode.PREVIEW;
  const isMultiSelect = mode === CategoryButtonMode.MULTISELECT;

  const fetchCategories = async (): Promise<void> => {
    CategoryService.getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        setCategories([]);
        console.error("Error fetching categories:", error);
      });
  };

  useEffect(() => {
    if (isPreviewMode && exampleCategoryData) {
      setCategories([exampleCategoryData]);
    } else if (!isPreviewMode) {
      fetchCategories();
    }
  }, [mode, exampleCategoryData, isPreviewMode]);

  useEffect(() => {
    if (resetTriggered) {
      fetchCategories();
      setSelectedCategoryList([]);
    }
  }, [resetTriggered]);

  useEffect(() => {
    onSelect(selectedCategoryList);
  }, [selectedCategoryList]);

  const isSingleRow = categories.length < 4;

  const getButtonStyle = (
    color: string,
    isActive: boolean
  ): React.CSSProperties => {
    return {
      width: isPreviewMode ? "105px" : isSingleRow ? "75px" : "75px",
      height: isPreviewMode ? "35px" : isSingleRow ? "28px" : "25px",
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
  };

  const toggleCategory = (category: ProductCategory) => {
    if (isPreviewMode) return;
    if (isMultiSelect) {
      setSelectedCategoryList((prev) => {
        const isAlreadySelected = prev.some((cat) => cat.id === category.id);
        if (isAlreadySelected) {
          return prev.filter((cat) => cat.id !== category.id);
        } else {
          return [...prev, category];
        }
      });
    } else {
      setSelectedCategoryList((prev) => {
        const isAlreadySelected = prev.some((cat) => cat.id === category.id);
        return isAlreadySelected ? [] : [category];
      });
    }
  };

  const isCategorySelected = (category: ProductCategory): boolean => {
    if (isPreviewMode) return false;
    return selectedCategoryList.some((cat) => cat.id === category.id);
  };

  return (
    <div className="category-buttons">
      {categories.map((category, index) => {
        const isActive = isCategorySelected(category);
        return (
          <button
            key={category.id || index}
            style={getButtonStyle(category.color, isActive)}
            className={`category-button ${isActive ? "active" : ""}`}
            onClick={() => toggleCategory(category)}
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
