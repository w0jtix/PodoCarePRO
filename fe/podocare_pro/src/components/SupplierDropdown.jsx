import React from "react";
import { useState, useRef, useEffect } from "react";
import AddSupplierPopup from "./Popups/AddSupplierPopup";

const SupplierDropdown = ({
  items,
  placeholder,
  selectedSupplier,
  onSelect,
  onAddSupplier,
  addSupplierVisible = true,
  multiSelect = false,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedItem, setSelectedItem] = useState(multiSelect ? [] : null);
  const [isAddSupplierPopupOpen, setIsAddSupplierPopupOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().startsWith(searchValue.toLowerCase())
  );

  const handleOpenAddSupplierPopup = () => {
    setIsAddSupplierPopupOpen(true);
  };

  const handleSelect = (item) => {
    if (multiSelect) {
      setSelectedItem((prev) =>
        prev.some((s) => s.id === item.id)
          ? prev.filter((s) => s.id !== item.id)
          : [...prev, item]
      );
      onSelect(
        selectedItem.some((s) => s.id === item.id)
          ? selectedItem.filter((s) => s.id !== item.id)
          : [...selectedItem, item]
      );
    } else {
      setSelectedItem((prev) => (prev?.id === item.id ? null : item));
      onSelect(item);
      setIsExpanded(false);
    }
  };

  const handleCloseAddSupplierPopup = () => {
    setIsAddSupplierPopupOpen(false);
  };

  useEffect(() => {
    if (multiSelect) {
      setSelectedItem(selectedSupplier ?? []);
    } else {
      setSelectedItem(selectedSupplier ?? null);
    }
  }, [selectedSupplier, multiSelect]);

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
    <div className="supplier-searchable-dropdown" ref={dropdownRef}>
      <button
        className={`supplier-dropdown-header ${
          multiSelect && selectedItem.length > 0 ? "selected" : ""
        }`}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="supplier-dropdown-placeholder-wrapper">
          <a
            className={`supplier-dropdown-header-a ${
              (multiSelect && selectedItem.length > 0) ||
              (!multiSelect && selectedItem)
                ? "center"
                : ""
            }`}
          >
            {multiSelect ? (
              selectedItem && selectedItem.length > 0 ? (
                selectedItem.length === 1 ? (
                  <div className="supplier-placeholder">
                    {selectedItem[0].name}
                  </div>
                ) : (
                  <div className="supplier-placeholder">{`[${selectedItem.length}]`}</div>
                )
              ) : (
                placeholder
              )
            ) : selectedItem ? (
              <div className="supplier-placeholder">{selectedItem.name}</div>
            ) : (
              placeholder
            )}
          </a>
        </div>
        <img
          src="src/assets/arrow_down.svg"
          alt="arrow down"
          className={`arrow-down ${isExpanded ? "rotated" : ""}`}
        />
      </button>
      {isExpanded && !isAddSupplierPopupOpen && (
        <div className="dropdown-menu">
          <section className="dropdown-search-and-add-new-supplier">
            <input
              type="text"
              className={`dropdown-search ${!addSupplierVisible ? "wide" : ""}`}
              placeholder="Szukaj..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {addSupplierVisible && (
              <button
                className="add-supplier-dropdown-button"
                onClick={handleOpenAddSupplierPopup}
              >
                <img
                  src="src/assets/addNew.svg"
                  alt="add new"
                  className="supplier-add-new-icon"
                />
              </button>
            )}
          </section>
          <ul className="dropdown-list">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <li
                  key={item.id}
                  className="dropdown-item"
                  onClick={() => handleSelect(item)}
                >
                  {item.name}
                  {multiSelect
                    ? selectedItem.some((s) => s.id === item.id) && (
                        <img
                          src="src/assets/tick.svg"
                          alt="selected"
                          className="supplier-tick-icon"
                        />
                      )
                    : selectedItem?.id === item.id && (
                        <img
                          src="src/assets/tick.svg"
                          alt="selected"
                          className="supplier-tick-icon"
                        />
                      )}
                </li>
              ))
            ) : (
              <li className="dropdown-item disabled">Nie znaleziono 🙄</li>
            )}
          </ul>
        </div>
      )}
      {isAddSupplierPopupOpen && (
        <AddSupplierPopup
          onClose={handleCloseAddSupplierPopup}
          onAddSupplier={(newSupplier) => {
            onAddSupplier(newSupplier);
            handleSelect(newSupplier);
          }}
        />
      )}
    </div>
  );
};

export default SupplierDropdown;
