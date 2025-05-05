import React from "react";
import { useState, useRef, useEffect } from "react";

/* single select -> item
multi select -> array of items */

/* FOR DASHBOARD BRAND SELECT -> BRANDBUTTON FOR clear and save buttons logic */

const DropdownSelect = ({
  items,
  placeholder,
  onSelect,
  onAddNew,
  addNewVisible = true,
  multiSelect = false,
  displayPopup = false,
  allowColors = false,
  PopupComponent,
  popupProps = {},
  reset
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selected, setSelected] = useState(multiSelect ? [] : null);
  const [isAddNewPopupOpen, setIsAddNewPopupOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() =>{
      setSearchValue("");
      setSelected([]);
      setIsDropdownVisible(false);
      setIsAddNewPopupOpen(false);
    },[reset]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().startsWith(searchValue.toLowerCase())
  );

  const handleOpenAddNewPopup = () => {
    setIsAddNewPopupOpen(true);
  };

  const handleSelect = (item) => {
    if (multiSelect) {
      setSelected((prev) =>
        prev.some((s) => s.id === item.id)
          ? prev.filter((s) => s.id !== item.id)
          : [...prev, item]
      );
      onSelect(
        selected.some((s) => s.id === item.id)
          ? selected.filter((s) => s.id !== item.id)
          : [...selected, item]
      );

    } else {
      setSelected((prev) => (prev?.id === item.id ? null : item));
      onSelect(item);
      setIsDropdownVisible(false);
    }
  };

  const handleCloseAddNewPopup = () => {
    setIsAddNewPopupOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
  });

  return (
    <div className="searchable-dropdown" ref={dropdownRef}>
      <button
        className={`dropdown-header ${
          allowColors && multiSelect && selected.length > 0 ? "selected" : ""
        }`}
        onClick={() => setIsDropdownVisible((prev) => !prev)}
      >
        <div className="dropdown-placeholder-wrapper">
          <a
            className={`dropdown-header-a ${
              (multiSelect && selected.length > 0) || (!multiSelect && selected)
                ? "center"
                : ""
            }`}
          >
            {multiSelect ? (
              selected && selected.length > 0 ? (
                selected.length === 1 ? (
                  <div className="dropdown-placeholder">{selected[0].name}</div>
                ) : (
                  <div className="dropdown-placeholder">{`[${selected.length}]`}</div>
                )
              ) : (
                placeholder
              )
            ) : selected ? (
              <div className="dropdown-placeholder">{selected.name}</div>
            ) : (
              placeholder
            )}
          </a>
        </div>
        <img
          src="src/assets/arrow_down.svg"
          alt="arrow down"
          className={`arrow-down ${isDropdownVisible ? "rotated" : ""}`}
        />
      </button>
      {isDropdownVisible && !isAddNewPopupOpen && (
        <div className="dropdown-menu">
          <section className="dropdown-search-and-add-new">
            <input
              type="text"
              className={`dropdown-search ${!addNewVisible ? "wide" : ""}`}
              placeholder="Szukaj..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {addNewVisible && (
              <button
                className="add-new-dropdown-button"
                onClick={handleOpenAddNewPopup}
              >
                <img
                  src="src/assets/addNew.svg"
                  alt="add new"
                  className="dropdown-add-new-icon"
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
                    ? selected.some((s) => s.id === item.id) && (
                        <img
                          src="src/assets/tick.svg"
                          alt="selected"
                          className="dropdown-tick-icon"
                        />
                      )
                    : selected?.id === item.id && (
                        <img
                          src="src/assets/tick.svg"
                          alt="selected"
                          className="dropdown-tick-icon"
                        />
                      )}
                </li>
              ))
            ) : (
              <li className="dropdown-item disabled">Nie znaleziono 🙄</li>
            )}
          </ul>
          {/* <div className="action-buttons">
            <button onClick={handleClear} className="clear-button">
              <h2>Wyczyść</h2>
            </button>
            <button onClick={handleSave} className="save-button">
              <h2>Zapisz</h2>
            </button>
          </div> */}
        </div>
      )}
      {displayPopup && isAddNewPopupOpen && PopupComponent && (
        <PopupComponent
          onClose={handleCloseAddNewPopup}
          onAddNew={(newItem) => {
            onAddNew(newItem);
            handleSelect(newItem);
          }}
        />
      )}
    </div>
  );
};

export default DropdownSelect;
