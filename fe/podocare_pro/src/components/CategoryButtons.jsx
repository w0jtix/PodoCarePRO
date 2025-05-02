import React from "react";
import { useState, useEffect } from "react";
import CategoryService from "../service/CategoryService";

const CategoryButtons = ({
  onSelect,
  resetTriggered,
  multiSelect = true,
  selectedId,
}) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState( selectedId ? selectedId :
    multiSelect ? [] : null
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
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCategories();
    setSelectedCategoryIds(multiSelect ? [] : null);
  }, [resetTriggered]);

  useEffect(() => {
    console.log("selectedCategoryIds", selectedCategoryIds);
    onSelect(selectedCategoryIds);
  }, [selectedCategoryIds]);

  const isSingleRow = categories.length < 5;

  const getButtonStyle = (color, isActive) => {
    return {
      width: isSingleRow ? "75px" : "55px",
      height: isSingleRow ? "28px" : "25px",
      backgroundColor: "transparent",
      border: `1px solid rgba(${color}, 0.5)`,
      boxShadow: `inset 0 0 65px rgba(${color}, ${isActive ? 0.9 : 0.2})`,
      color: "#000",
      borderRadius: "8px",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      transition: "all 0.1s ease",
    };
  };

  const toggleCategory = (categoryId) => {
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
        const isActive = multiSelect
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
                fontSize: isSingleRow
                  ? "var(--font-size-mid-button)"
                  : "var(--font-size-small-button)",
                fontWeight: "var(--font-weight-button)",
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
