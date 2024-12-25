import React from 'react'
import { useState } from 'react';

const CategoryButtons = ( { onFilter, filterProductDTO }) => {

  const [selectedCategories, setSelectedCategories] = useState(filterProductDTO?.productTypes || [] );

  const categories = ["Sale", "Tool", "Equipment"];
  const categoryMap = {
    "Sale" : "Produkty", 
    "Tool" : "Narzędzia", 
    "Equipment" : "Sprzęt"

  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) => {
      const updatedCategories = prev.includes(category) 
      ? prev.filter((cat) => cat !== category) : [...prev, category];
    
      const updatedFilterDTO = {
        ...filterProductDTO,
        productTypes: updatedCategories
      }

      onFilter(updatedFilterDTO);
      return updatedCategories;
    })
  }

  return (
    <div className="category-buttons">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-button ${category.toLowerCase()} ${selectedCategories.includes(category) ? "active" : ""}`}
          onClick={() => toggleCategory(category)}
        >
          <h2 className="category-button-h2">{categoryMap[category]}</h2>
        </button>
      ))}
    </div>
  )
}

export default CategoryButtons
