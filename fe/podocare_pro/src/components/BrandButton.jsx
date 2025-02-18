import React from "react";
import { useState, useRef, useEffect } from "react";
import BrandService from "../service/BrandService";

const BrandButton = ({ brandFilterDTO, onSelect }) => {
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tempSelectedIds, setTempSelectedIds] = useState([]);
  const [brands, setBrands] = useState([]);
  const dropdownRef = useRef(null);

  const filteredBrands = brands
    .filter((item) =>
      item.name.toLowerCase().startsWith(searchValue.toLowerCase())
    )
    .sort();

  const fetchBrands = async () => {
    const { productTypes, keyword } = brandFilterDTO;

    if (productTypes.length === 0) {
      setBrands([]);
      return;
    }

    return BrandService.getFilteredBrands(productTypes, keyword)
      .then((filteredData) => {
        const sortedBrands = filteredData.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setBrands(sortedBrands);
      })
      .catch((error) => {
        console.error("Error fetching brands:", error);
      });
  };

  useEffect(() => {
    fetchBrands();
  }, [brandFilterDTO]);

  useEffect(() => {
    if (isExpanded) {
      setTempSelectedIds(selectedIds);
    }
  }, [isExpanded]);

  const handleSelect = (id) => {
    setTempSelectedIds((prevTempSelectedIds) =>
      prevTempSelectedIds.includes(id)
        ? prevTempSelectedIds.filter((selectedId) => selectedId !== id)
        : [...prevTempSelectedIds, id]
    );
  };

  const handleClear = () => {
    setTempSelectedIds([]);
  };

  const handleSave = () => {
    setSelectedIds(tempSelectedIds);
    onSelect({
      productTypes: brandFilterDTO.productTypes,
      selectedIds: tempSelectedIds,
    });
    setIsExpanded(false);
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
    <div className="brand-searchable-dropdown" ref={dropdownRef}>
      <button
        className="brand-dropdown-header"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <a>Wybierz Marki</a>
        <img
          src="src/assets/arrow_down.svg"
          alt="arrow down"
          className={`arrow-down ${isExpanded ? "rotated" : ""}`}
        />
      </button>
      {isExpanded && (
        <div className="brand-dropdown-menu">
          <input
            type="text"
            className="brand-dropdown-search"
            placeholder="Szukaj..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          <ul className="brand-dropdown-list">
            {filteredBrands.length > 0 ? (
              filteredBrands.map((item) => (
                <li
                  key={item.id}
                  className={`brand-dropdown-item ${
                    tempSelectedIds.includes(item.id) ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(item.id)}
                >
                  {item.name}
                  {tempSelectedIds.includes(item.id) && (
                    <img
                      src="src/assets/tick.svg"
                      alt="selected"
                      className="brand-tick-icon"
                    />
                  )}
                </li>
              ))
            ) : (
              <li className="brand-dropdown-item disabled">
                Nie znaleziono 🙄
              </li>
            )}
          </ul>
          <div className="action-buttons">
            <button onClick={handleClear} className="clear-button">
              <h2>Wyczyść</h2>
            </button>
            <button onClick={handleSave} className="save-button">
              <h2>Zapisz</h2>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandButton;
