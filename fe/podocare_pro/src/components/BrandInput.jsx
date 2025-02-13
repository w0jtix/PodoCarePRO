import React from "react";
import { useState, useRef, useEffect } from "react";
import BrandService from "../service/BrandService";

const BrandInput = ({ onBrandSelect }) => {
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    if (keyword.trim().length > 0) {
      BrandService.getFilteredBrandsByKeyword(keyword)
        .then((filteredData) => {
          setFilteredBrands(filteredData);
          setIsDropdownOpen(filteredData.length > 0);
        })
        .catch((error) => console.error(error.message));
    } else {
      setFilteredBrands([]);
      setIsDropdownOpen(false);
    }
  }, [keyword]);

  const handleInputChange = (e) => {
    setKeyword(e.target.value);
    setSelectedBrand(null);
  };

  const handleBrandSelect = (brandName) => {
    setSelectedBrand(brandName);
    setKeyword(brandName);
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 10);
    if (onBrandSelect) {
      onBrandSelect(brandName);
    }
  };

  const handleInputBlur = () => {
    if (keyword && !selectedBrand) {
      onBrandSelect(keyword);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key == "Enter" && keyword && !selectedBrand) {
      onBrandSelect(keyword);
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="brand-name-container" ref={dropdownRef}>
      <input
        type="text"
        className="new-products-popup-input-brand-name"
        placeholder=""
        value={selectedBrand || keyword}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        onBlur={handleInputBlur}
      />
      {isDropdownOpen && keyword != "" && filteredBrands.length > 0 && (
        <ul className="new-products-popup-brand-name-dropdown">
          {filteredBrands.slice(0, 3).map((suggestion) => (
            <li
              key={suggestion.id}
              className="new-products-popup-brand-name-dropdown-item"
              onClick={(e) => {
                e.stopPropagation();
                handleBrandSelect(suggestion.name);
              }}
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BrandInput;
