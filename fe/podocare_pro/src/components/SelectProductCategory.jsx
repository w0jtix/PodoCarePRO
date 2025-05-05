import React from "react";
import { useState, useEffect, useRef } from "react";

const SelectProductCategory = ({ selectedCategory, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef(null);

  const categories = ["Sale", "Tool", "Equipment"];
  const categoryMap = {
    Sale: "Produkty",
    Tool: "Narzędzia",
    Equipment: "Sprzęt",
  };

  const handleSelectCategory = (category) => {
    onSelect(category);
    setIsExpanded(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="category-select-container" ref={dropdownRef}>
      <button className="category-select-button" onClick={toggleDropdown}>
        {selectedCategory ? categoryMap[selectedCategory] : "---------"}
        <img
          src="src/assets/arrow_down.svg"
          alt="arrow down"
          className={`category-select-arrow-icon ${
            isExpanded ? "rotated" : ""
          }`}
        />
      </button>
      {isExpanded && (
        <ul className="category-select">
          {categories.map((category) => (
            <li
              key={category}
              className="category-select-item"
              onClick={() => handleSelectCategory(category)}
            >
              {categoryMap[category]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelectProductCategory;
