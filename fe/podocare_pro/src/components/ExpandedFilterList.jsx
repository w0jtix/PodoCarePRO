import React from "react";
import { useState } from "react";

const ExpandedFilterList = ({ itemList, onSave }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((id) => id !== id) : [...prev, id]
    );
  };

  const handleClear = () => {
    setSelectedIds([]);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(selectedIds);
    }
  };

  return (
    <div className="expanded-filter-list">
      <div className="filter-expand" onClick={(e) => e.stopPropagation()}>
        <div className="filter-list">
          {itemList.map((item) => (
            <label key={item.id} className="filter-item">
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => handleSelect(item.id)}
              />
              {item.name}
              <span></span>
            </label>
          ))}
        </div>
        <div className="action-buttons">
          <button onClick={handleClear} className="clear-button">
            <h2>Wyczyść</h2>
          </button>
          <button onClick={handleSave} className="save-button">
            <h2>Zapisz</h2>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpandedFilterList;
