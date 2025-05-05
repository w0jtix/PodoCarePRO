import React from "react";
import { useState, useEffect } from "react";
import CategoryService from "../service/CategoryService";

const CategoryButtons = ({
  onSelect,
  resetTriggered,
  multiSelect = true,
  selectedId,
  exampleDisplayMode = false,
  exampleCategoryData,
}) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(
    selectedId ? selectedId : multiSelect ? [] : null
  );
  const [categories, setCategories] = useState([]);

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
    if (exampleDisplayMode) {
      if (exampleCategoryData) {
        setCategories([exampleCategoryData]);
      }
    } else {
      fetchCategories();
    }
  }, [exampleDisplayMode, exampleCategoryData]);

  useEffect(() => {
    if (!exampleDisplayMode) {
      fetchCategories();
    }

    if (resetTriggered) {
      setSelectedCategoryIds(multiSelect ? [] : null);
    }
  }, [resetTriggered]);

  useEffect(() => {
    if (onSelect) {
      onSelect(selectedCategoryIds);
    }
  }, [selectedCategoryIds]);

  const isSingleRow = categories.length < 4;

  const getButtonStyle = (color, isActive) => {
    return {
      width: exampleDisplayMode ? "105px" : isSingleRow ? "75px" : "75px",
      height: exampleDisplayMode ? "35px" : isSingleRow ? "28px" : "25px",
      backgroundColor: "transparent",
      border: `1px solid rgba(${color}, 0.5)`,
      boxShadow: `inset 0 0 65px rgba(${color}, ${isActive ? 0.9 : 0.2})`,
      color: "#000",
      borderRadius: "8px",
      justifyContent: "center",
      alignItems: "center",
      cursor: exampleDisplayMode ? "default" : "pointer",
      transition: "all 0.1s ease",
    };
  };

  const toggleCategory = (categoryId) => {
    if (exampleDisplayMode) return;
    if (multiSelect) {
      setSelectedCategoryIds((prev) => {
        const updatedCategoryIds = prev.includes(categoryId)
          ? prev.filter((id) => id !== categoryId)
          : [...prev, categoryId];
        return updatedCategoryIds;
      });
    } else {
      setSelectedCategoryIds((prev) =>
        prev === categoryId ? null : categoryId
      );
    }
  };

  return (
    <div className="category-buttons">
      {categories.map((category) => {
        const isActive = exampleDisplayMode
          ? false
          : multiSelect
          ? selectedCategoryIds.includes(category.id)
          : selectedCategoryIds == category.id;
        return (
          <button
            key={category.id}
            style={getButtonStyle(category.color, isActive)}
            className={`category-button ${isActive ? "active" : ""}`}
            onClick={() => toggleCategory(category.id)}
          >
            <h2
              className="category-button-h2"
              style={{
                fontFamily: "var(--font-h2-outfit)",
                fontSize: exampleDisplayMode
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
};

export default CategoryButtons;
