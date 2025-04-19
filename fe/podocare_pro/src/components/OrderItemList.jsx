import React from "react";
import { useState, useEffect, useRef } from "react";
import SelectVATButton from "./SelectVATButton";
import AllProductService from "../service/AllProductService";
import ProductActionButton from "./ProductActionButton";
import CostInput from "./CostInput";
import DigitInput from "./DigitInput";

const OrderItemList = ({
  attributes,
  items,
  setItems,
  onItemsChange,
  action,
  initialOrderProductList,
  setCurrentOrderProductList,
  setHasWarning,
}) => {
  const dropdownRef = useRef(null);
  const [adjustedItems, setAdjustedItems] = useState([]);
  const [matchingProducts, setMatchingProducts] = useState({});
  const [mountDone, setMountDone] = useState(false);
  const [dropdownVisibility, setDropdownVisibility] = useState({});
  const [warningVisible, setWarningVisible] = useState({});

  const attributeMap = {
    Nazwa: "productName",
    "Cena jedn.": "price",
    Ilość: "quantity",
    VAT: "VATrate",
    Cena: "orderPrice",
  };

  useEffect(() => {
    if (JSON.stringify(items) !== JSON.stringify(adjustedItems)) {
      if (action === "Edit") {
        if (mountDone) {
          const newOrderProducts = items.filter(
            (item) =>
              !initialOrderProductList.some(
                (initialItem) => initialItem.id === item.orderProductId
              ) || !item.orderProductId
          );
          const newUniqueOrderProducts = newOrderProducts.filter(
            (newItem) =>
              !adjustedItems.some(
                (adjustedItem) => adjustedItem.id === newItem.id
              )
          );

          if (newUniqueOrderProducts.length > 0) {
            setAdjustedItems((prev) => [
              ...prev,
              ...newUniqueOrderProducts.map((item) => ({
                id: item.orderProductId ?? item.id,
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity,
                VATrate: item.VATrate,
                orderPrice: item.price * item.quantity,
              })),
            ]);
          }
        } else {
          const fetchedOrderProductList = items.map((item) => ({
            id: item.orderProductId ?? item.id,
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            VATrate: item.VATrate,
            orderPrice: item.price * item.quantity,
          }));
          setAdjustedItems(fetchedOrderProductList);
          setMountDone(true);
        }
      } else {
        setAdjustedItems([...items]);
      }
    }
  }, [items]);

  useEffect(() => {
    if (action === "Edit") {
      setCurrentOrderProductList(adjustedItems);
    }
  }, [adjustedItems]);

  const getOrderProductListChanges = (initial, edited) => {
    const removedOrderProducts = [];
    const addedOrderProducts = [];
    const editedOrderProducts = [];

    const initialMap = new Map(initial.map((op) => [op.id, op]));
    const editedMap = new Map(edited.map((op) => [op.id, op]));

    initial.forEach((op) => {
      if (!editedMap.has(op.id)) {
        removedOrderProducts.push(op.id);
      } else {
        const editedOrderProduct = editedMap.get(op.id);
        const orderProductChanges = {};

        let isProductReplaced = false;

        Object.keys(op).forEach((key) => {
          if (op[key] !== editedOrderProduct[key]) {
            if (key === "productName" || key === "productId") {
              isProductReplaced = true;
            } else {
              orderProductChanges[key] = editedOrderProduct[key];
            }
          }
        });
        if (isProductReplaced) {
          removedOrderProducts.push(op.id);
          addedOrderProducts.push(editedOrderProduct);
        } else if (Object.keys(orderProductChanges).length > 0) {
          editedOrderProducts.push({
            orderProductId: op.id,
            productId: op.productId,
            ...orderProductChanges,
          });
        }
      }
    });

    edited.forEach((op) => {
      if (!initialMap.has(op.id)) {
        addedOrderProducts.push(op);
      }
    });

    return {
      removedOrderProducts,
      addedOrderProducts,
      editedOrderProducts,
    };
  };

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
      setAdjustedItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, productId: null } : item
        )
      );
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

          const matchingProduct = filteredData.find(
            (product) => product.productName === value
          );
          if (matchingProduct) {
            setAdjustedItems((prevItems) =>
              prevItems.map((item) =>
                item.id === itemId
                  ? { ...item, productId: matchingProduct.id }
                  : item
              )
            );
          } else {
            setAdjustedItems((prevItems) =>
              prevItems.map((item) =>
                item.id === itemId ? { ...item, productId: null } : item
              )
            );
          }
        })
        .catch((error) => {
          console.error("Error fetching product suggestions: ", error);
          setMatchingProducts((prevProducts) => ({
            ...prevProducts,
            [itemId]: [],
          }));
          setAdjustedItems((prevItems) =>
            prevItems.map((item) =>
              item.id === itemId ? { ...item, productId: null } : item
            )
          );
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

    if (field === "quantity" && action === "Edit") {
      const item = adjustedItems.find((item) => item.id === itemId);
      const initialItem = initialOrderProductList.find(
        (item) => item.id === itemId
      );
      const productId = item ? item.productId : null;
      if (productId) {
        return AllProductService.findProductByIdAndIncludeActiveInstances(
          productId
        )
          .then((data) => {
            const activeCount = data.activeProductInstances.length;
            const initialQty = initialItem.quantity;
            const newQty = parseInt(value, 10);
            const qtyDifference = initialQty - newQty;
            const shouldWarn = qtyDifference > 0 && qtyDifference > activeCount;
            setWarningVisible((prevVisibility) => ({
              ...prevVisibility,
              [itemId]: shouldWarn,
            }));
            setHasWarning(shouldWarn);
          })
          .catch((error) => {
            console.error("Error checking supply count:", error);
          });
      }
    }
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
    if (action === "Edit") {
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    }
  };

  const handleProductSelect = (itemId, productId, productName) => {
    const selectedProduct = matchingProducts[itemId]?.find(
      (p) => p.productName === productName && p.id === productId
    );
    if (selectedProduct) {
      setAdjustedItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                productId: selectedProduct.id,
                productName: selectedProduct.productName,
              }
            : item
        )
      );
    }
    toggleDropdown(itemId, false);
  };

  useEffect(() => {
    if (action === "Create") {
      const updatedList = adjustedItems.map((item) => ({
        id: item.id,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        VATrate: item.VATrate,
        orderPrice: item.orderPrice,
        productId: item.productId,
      }));
      onItemsChange(updatedList);
    } else if (action === "Edit") {
      const orderProductChangesObject = getOrderProductListChanges(
        initialOrderProductList,
        adjustedItems
      );

      onItemsChange(orderProductChangesObject);
    }
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
                <ProductActionButton
                  src={"src/assets/cancel.svg"}
                  alt={"Usuń Produkt"}
                  text={"Usuń"}
                  onClick={() => handleItemRemove(item.id)}
                  disableText={true}
                />
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
                  {warningVisible[item.id] && action === "Edit" && (
                    <img
                      src="src/assets/warning.svg"
                      alt="Warning"
                      className="order-item-warning-icon"
                    />
                  )}
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
                                  suggestion.id,
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
                <CostInput
                  selectedCost={item.price}
                  onChange={(value) =>
                    handleInputChange(item.id, "price", parseFloat(value) || 0)
                  }
                  placeholder={"0.00"}
                />
              ) : attr.name === "Ilość" ? (
                <DigitInput
                  placeholder={"1"}
                  startValue={item.quantity}
                  onInputValue={(value) =>
                    handleInputChange(
                      item.id,
                      "quantity",
                      parseInt(value, 10) || 1
                    )
                  }
                />
              ) : attr.name === "VAT" ? (
                <SelectVATButton
                  selectedVAT={item.VATrate}
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
