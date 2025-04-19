import React from "react";
import { useState, useRef, useEffect } from "react";
import SupplierService from "../service/SupplierService";

const SupplierInput = ({ onSupplierSelect }) => {
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    if (keyword.trim().length > 0) {
      SupplierService.getFilteredSuppliersByKeyword(keyword)
        .then((filteredData) => {
          setFilteredSuppliers(filteredData);
          setIsDropdownOpen(filteredData.length > 0);
        })
        .catch((error) => console.error(error.message));
    } else {
      setFilteredSuppliers([]);
      setIsDropdownOpen(false);
    }
  }, [keyword]);

  const handleInputChange = (e) => {
    setKeyword(e.target.value);
    setSelectedSupplier(null);
  };

  const handleSupplierSelect = (supplierName) => {
    setSelectedSupplier(supplierName);
    setKeyword(supplierName);
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 10);
    if (onSupplierSelect) {
      onSupplierSelect(supplierName);
    }
  };

  const handleInputBlur = () => {
    if (keyword && !selectedSupplier) {
      onSupplierSelect(keyword);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key == "Enter" && keyword && !selectedSupplier) {
      onSupplierSelect(keyword);
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
    <div className="supplier-brand-name-container" ref={dropdownRef}>
      <input
        type="text"
        className="popup-input-brand-supplier-name"
        placeholder=""
        value={selectedSupplier || keyword}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        onBlur={handleInputBlur}
      />
      {isDropdownOpen && keyword != "" && filteredSuppliers.length > 0 && (
        <ul className="supplier-brand-name-dropdown">
          {filteredSuppliers.slice(0, 3).map((suggestion) => (
            <li
              key={suggestion.id}
              className="supplier-brand-name-dropdown-item"
              onClick={(e) => {
                e.stopPropagation();
                handleSupplierSelect(suggestion.name);
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

export default SupplierInput;
