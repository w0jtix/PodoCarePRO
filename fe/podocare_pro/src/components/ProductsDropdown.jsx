import React from "react";
import { useState, useEffect } from "react";
import AllProductService from "../service/AllProductService";

const ProductsDropdown = ({ onSelect }) => {
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);

  const categoryColors = {
    Sale: "rgb(0, 253, 0)",
    Tool: "rgb(253, 173, 0)",
    Equipment: "rgb(253, 0, 190)",
  };

  const filteredItems = items.filter((item) =>
    item.productName.toLowerCase().startsWith(searchValue.toLowerCase())
  );

  const handleSelect = (item) => {
    console.log("s", item);
    setSelectedItem(item);
    onSelect(item);
    setIsExpanded(false);
  };

  const fetchAllProducts = () => {
    setLoading(true);
    AllProductService.getAllProducts()
      .then((response) => {
        const sortedItems = response.sort((a, b) =>
          a.productName.localeCompare(b.productName)
        );
        setItems(sortedItems);
      })
      .catch((error) => {
        setItems([]);
        console.error("Error fetching products:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    isExpanded ? fetchAllProducts() : null;
  }, [isExpanded]);

  return (
    <div className="product-searchable-dropdown">
      <button
        className="product-dropdown-header"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <img
          src="src/assets/searchbar_icon.svg"
          alt="searchbar-icon"
          className="dashboard-icon"
        ></img>
        <input
          type="text"
          className="dropdown-search"
          placeholder="Wybierz Produkt do edycji..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <img
          src="src/assets/arrow_down.svg"
          alt="arrow down"
          className={`arrow-down ${isExpanded ? "rotated" : ""}`}
        />
      </button>
      {isExpanded && (
        <div className="dropdown-menu">
          {!loading && items.length > 0 && (
            <ul className="dropdown-list">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <li
                    key={item.id}
                    className="dropdown-item"
                    onClick={() => handleSelect(item)}
                  >
                    <div
                      className="category-container"
                      style={{
                        backgroundColor: categoryColors[item.category],
                      }}
                    ></div>
                    <div className="dropdown-item-name">{item.productName}</div>

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
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsDropdown;
