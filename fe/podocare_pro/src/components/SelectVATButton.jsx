import React from 'react'
import { useState, useEffect, useRef } from 'react';
import vatValues from  '../data/vatValues'

const SelectVATButton = ({ onSelect }) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedItem, setSelectedItem] = useState(vatValues[1]);
    const dropdownRef = useRef(null);

    const handleSelect = (item) => {
        setSelectedItem(item);
        onSelect(item);
        setIsExpanded(false);
    }

    const toggleDropdown = (e) => {
      e.stopPropagation();
        setIsExpanded((prev) => !prev);
      };

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
    <div className="vat-select-container" ref={dropdownRef}>
      <button className="vat-select-button" onClick={toggleDropdown}>
        {selectedItem ? (<a className='vat-button-selection'>{typeof selectedItem === "number" ? `${selectedItem}%` : selectedItem}</a>) : "0%"}
        <img
          src="src/assets/arrow_down.svg"
          alt="arrow down"
          className={`vat-select-arrow-icon ${isExpanded ? "rotated" : ""}`}
        />
      </button>
      {isExpanded && (
        <ul className="vat-select">
          {vatValues.length > 0 ? (
            vatValues.map((item, index) => (
              <li
                key={index}
                className={`vat-select-item ${
                    selectedItem === item ? "selected" : ""
                  }`}
                onClick={() => handleSelect(item)}
              >
                {typeof item === "number" ? `${item}%` : item}
              </li>
            ))
          ) : (
            <li className="vat-select-item disabled">No items available</li>
          )}
        </ul>
      )}
    </div>
  )
}

export default SelectVATButton
