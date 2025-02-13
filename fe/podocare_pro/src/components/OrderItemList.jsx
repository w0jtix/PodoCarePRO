import React from "react";
import { useState, useEffect, useRef } from "react";
import SelectVATButton from "./SelectVATButton";
import axios from "axios";
import AllProductService from "../service/AllProductService";

const OrderItemList = ({ attributes, items, onItemsChange }) => {
  const dropdownRef = useRef(null);
  const [adjustedItems, setAdjustedItems] = useState([]);
  const [matchingProducts, setMatchingProducts] = useState({});
  const [dropdownVisibility, setDropdownVisibility] = useState({});

  const attributeMap = {
    Nazwa: "productName",
    "Cena jedn.": "price",
    Ilość: "quantity",
    VAT: "VATrate",
    Cena: "orderPrice",
  };

  useEffect(() => {
    if (JSON.stringify(items) !== JSON.stringify(adjustedItems)) {
      setAdjustedItems([...items]);
    }
  }, [items]);

  const getNestedValue = (obj, path) => {
    return path
      ? path.split(".").reduce((acc, part) => acc && acc[part], obj)
      : null;
  };

  const toggleDropdown = (itemId, isOpen) => {
    setDropdownVisibility((prevVisibility) => ({
      ...prevVisibility,
      [itemId]: isOpen,
    }));
  };

  const handleProductNameChange = async (itemId, value) => {
    setAdjustedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, productName: value } : item
      )
    );

    toggleDropdown(itemId, true);

    if (value.trim() === "") {
      setMatchingProducts((prevProducts) => ({
        ...prevProducts,
        [itemId]: [],
      }));
      toggleDropdown(itemId, false);
      return;
    }

    if (value.trim().length > 0) {
      AllProductService.getFilteredProducts(value)
        .then((filteredData) => {
          setMatchingProducts((prevProducts) => ({
            ...prevProducts,
            [itemId]: filteredData,
          }));
        })
        .catch((error) => {
          console.error("Error fetching product suggestions: ", error);
          setMatchingProducts((prevProducts) => ({
            ...prevProducts,
            [itemId]: [],
          }));
        });
    }
  };

  const handleInputChange = (itemId, field, value) => {
    const roundedValue =
      field === "price" ? parseFloat(value).toFixed(2) : value;
    setAdjustedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: parseFloat(roundedValue),
              orderPrice:
                field === "price"
                  ? parseFloat(value || 0) * item.quantity
                  : item.price * parseInt(value || 1, 10),
            }
          : item
      )
    );
  };

  const handleVatSelect = (itemId, selectedVAT) => {
    setAdjustedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, VATrate: selectedVAT } : item
      )
    );
  };

  const handleItemRemove = (itemId) => {
    setAdjustedItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId)
    );
  };

  const handleProductSelect = (itemId, productName) => {
    const selectedProduct = matchingProducts[itemId]?.find(
      (p) => p.productName === productName
    );
    if (selectedProduct) {
      setAdjustedItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                productName: selectedProduct.productName,
              }
            : item
        )
      );
    }
    toggleDropdown(itemId, false);
  };

  useEffect(() => {
    const updatedList = adjustedItems.map((item) => ({
      id: item.id,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      VATrate: item.VATrate,
      orderPrice: item.orderPrice,
    }));
    onItemsChange(updatedList);
  }, [adjustedItems]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideDropdown =
        dropdownRef.current && dropdownRef.current.contains(event.target);

      if (!isInsideDropdown) {
        setTimeout(() => {
          setDropdownVisibility({});
        }, 100);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="order-item-list">
      {adjustedItems.map((item, index) => (
        <div key={`${item.id}-${index}`} className="order-item">
          {attributes.map((attr) => (
            <div
              key={`${item.id}-${attr.name}`}
              className={`order-attribute-item ${
                attr.name === "" ? "order-category-column" : ""
              }`}
              style={{
                width: attr.width,
                justifyContent: attr.justify,
              }}
            >
              {attr.name === "" ? (
                <button
                  className="order-item-remove-button"
                  onClick={() => handleItemRemove(item.id)}
                >
                  <img
                    src="src/assets/cancel.svg"
                    alt="Remove"
                    className="order-item-remove-icon"
                  />
                </button>
              ) : attr.name === "Nazwa" ? (
                <div className="product-name-container" ref={dropdownRef}>
                  <input
                    type="text"
                    className="order-table-input-product-name"
                    placeholder=""
                    value={item.productName}
                    onFocus={() => toggleDropdown(item.id, true)}
                    onChange={(e) => {
                      handleProductNameChange(item.id, e.target.value);
                    }}
                  />
                  {dropdownVisibility[item.id] &&
                    item.productName &&
                    matchingProducts[item.id]?.length > 0 && (
                      <ul
                        className="product-name-dropdown"
                        style={{
                          top: index >= 6 ? "auto" : "100%",
                          bottom: index >= 6 ? "100%" : "auto",
                        }}
                      >
                        {matchingProducts[item.id]
                          .slice(0, 3)
                          .map((suggestion) => (
                            <li
                              key={`${item.id}-${suggestion.productName}`}
                              className="product-name-dropdown-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductSelect(
                                  item.id,
                                  suggestion.productName
                                );
                              }}
                            >
                              {suggestion.productName}
                            </li>
                          ))}
                      </ul>
                    )}
                </div>
              ) : attr.name === "Cena jedn." ? (
                <input
                  type="number"
                  className="order-table-input-price"
                  step="0.01"
                  value={item.price}
                  onChange={(e) =>
                    handleInputChange(
                      item.id,
                      "price",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              ) : attr.name === "Ilość" ? (
                <input
                  type="number"
                  className="order-table-input-quantity"
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleInputChange(
                      item.id,
                      "quantity",
                      parseInt(e.target.value, 10) || 1
                    )
                  }
                />
              ) : attr.name === "VAT" ? (
                <SelectVATButton
                  selectedVAT = {item.VATrate}
                  onSelect={(selectedVAT) =>
                    handleVatSelect(item.id, selectedVAT)
                  }
                />
              ) : attr.name === "Cena" ? (
                <span>
                  {isNaN(item.orderPrice) ? "0.00" : item.orderPrice.toFixed(2)}
                </span>
              ) : (
                getNestedValue(item, attributeMap[attr.name])
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default OrderItemList;
