import React from 'react'
import { useState, useRef, useEffect } from "react";
import AddSupplierPopup from './AddSupplierPopup';

const SupplierDropdown = ({ items, placeholder, selectedSupplier, onSelect, onAddSupplier }) => {
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddSupplierPopupOpen, setIsAddSupplierPopupOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().startsWith(searchValue.toLowerCase())
  );

  const handleOpenAddSupplierPopup = () => {
    setIsAddSupplierPopupOpen(true);
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    onSelect(item);
    setIsExpanded(false);
  };

  const handleCloseAddSupplierPopup = () => {
    setIsAddSupplierPopupOpen(false);
  }

  useEffect(() => {
    selectedSupplier  === null ? setSelectedItem(null) : selectedItem;
  }, [selectedSupplier]);

  useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsExpanded(false)
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
  
      return () => { document.removeEventListener('mousedown', handleClickOutside)
    };
    }, []);       
    

  return (
    <div className="supplier-searchable-dropdown" ref={dropdownRef}>
      <button
        className="supplier-dropdown-header"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <a>{selectedItem ? (
          <div className="supplier-placeholder"> 
            {selectedItem.name}
          </div> 
              ):(  
                placeholder 
                )}
              </a>
        <img 
            src="src/assets/arrow_down.svg" 
            alt="arrow down" 
            className={`arrow-down ${isExpanded ? 'rotated' : ''}`}/>
      </button>
      {isExpanded && !isAddSupplierPopupOpen && (
        <div className="dropdown-menu">
          <section className="dropdown-search-and-add-new-supplier">
            <input
              type="text"
              className="dropdown-search"
              placeholder="Szukaj..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button 
              className="add-supplier-dropdown-button" 
              onClick={handleOpenAddSupplierPopup}>
                <img 
                  src='src/assets/addNew.svg' 
                  alt="add new" 
                  className='supplier-add-new-icon' />
            </button>
            
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
                  {selectedItem?.id === item.id && (
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
  )
}

export default SupplierDropdown
