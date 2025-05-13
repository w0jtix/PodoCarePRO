import React from "react";
import { useState, useEffect, useRef } from "react";
import SelectVATButton from "../SelectVATButton";
import AllProductService from "../../service/AllProductService";
import ProductActionButton from "../ProductActionButton";
import CostInput from "../CostInput";
import DigitInput from "../DigitInput";
import TextInput from "../TextInput";
import SupplyManagerService from "../../service/SupplyManagerService";

const OrderItemList = ({
  attributes,
  items,
  onItemsChange,
  action,

  setHasWarning,
}) => {
  const [warningVisible, setWarningVisible] = useState({});
  const [orderProductDTOList, setOrderProductDTOList] = useState(items ?? []);
  const [productSuggestions, setProductSuggestions] = useState({});
  const [changesFlag, setChangesFlag] = useState(false);
  const [availableSupply, setAvailableSupply] = useState({});
  const [initialQuantities, setInitialQuantities] = useState({});

  useEffect(() => {
    setOrderProductDTOList(items ?? []);
    if (action === "Edit") {
      fetchSupply();
    }
  }, [items]);

  useEffect(() => {
    if (items && items.length > 0) {
      const quantitiesMap = items.reduce((acc, item) => {
        if (item.id != null) {
          acc[item.id] = item.quantity;
        }
        return acc;
      }, {});
      setInitialQuantities(quantitiesMap);
    }
  }, []);

  const attributeMap = {
    Nazwa: "productName",
    "Cena jedn.": "price",
    Ilość: "quantity",
    VAT: "vatRate",
    Cena: "orderPrice",
  };

  useEffect(() => {
    onItemsChange(orderProductDTOList);
  }, [changesFlag]);

  const fetchSupply = async () => {
    const productIdsToCheckSupplyFor = items
      .map((item) => item.productId)
      .filter((id) => id != null);

    const filterDTO = { productIds: [...new Set(productIdsToCheckSupplyFor)] };

    return SupplyManagerService.getManagers(filterDTO)
      .then((data) => {
        const supplyMap = {};
        data.forEach((manager) => {
          supplyMap[manager.productId] = manager.supply;
        });
        setAvailableSupply(supplyMap);
      })
      .catch((error) => {
        console.error("Error fetching supply managers:", error);
      });
  };

  const updateSupplyWarnings = (idToCheck, initialQty, currentQty) => {
    const availableStock = availableSupply[idToCheck];
    const differenceQty = initialQty - currentQty;

    const orderProductIds = orderProductDTOList
      .filter((orderProduct) => orderProduct.productId === idToCheck)
      .map((orderProduct) => orderProduct.id);

    if (differenceQty > 0 && differenceQty > availableStock) {
      orderProductIds.forEach((id) =>
        setWarningVisible((prevVisibility) => ({
          ...prevVisibility,
          [id]: true,
        }))
      );
      setHasWarning(true);
    } else {
      orderProductIds.forEach((id) =>
        setWarningVisible((prevVisibility) => {
          const newVisibility = { ...prevVisibility };
          delete newVisibility[id];
          return newVisibility;
        })
      );
      setHasWarning((prev) => {
        const otherWarnings = Object.keys(warningVisible).filter(
          (id) => !orderProductIds.includes(id)
        );
        return otherWarnings.length > 0;
      });
    }
  };

  const handleItemRemove = (itemId) => {
    const qtyBeforeChange = initialQuantities[itemId];
    setOrderProductDTOList((prevItems) =>
      prevItems.filter((item) => item.id !== itemId)
    );
    setChangesFlag((prev) => !prev);
    if (action === "Edit") {
      const productId = orderProductDTOList.find(
        (item) => item.id === itemId
      )?.productId;
      updateSupplyWarnings(productId, qtyBeforeChange, 0);
    }
  };

  const handleProductNameChange = async (itemId, selection) => {
    if (typeof selection === "string") {
      fetchProductSuggestions(itemId, selection);
      setOrderProductDTOList((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? { ...item, productId: null, productName: selection }
            : item
        )
      );
    } else {
      setOrderProductDTOList((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? { ...item, productId: selection.id, productName: selection.name }
            : item
        )
      );
    }

    setChangesFlag((prev) => !prev);
  };

  const fetchProductSuggestions = async (itemId, keyword) => {
    if (keyword.trim().length === 0) {
      setProductSuggestions((prev) => ({
        ...prev,
        [itemId]: [],
      }));
      return;
    }
    const filterDTO = { keyword: keyword, includeZero: true };

    AllProductService.getProducts(filterDTO)
      .then((data) => {
        setProductSuggestions((prev) => ({
          ...prev,
          [itemId]: data,
        }));
      })
      .catch((error) => {
        console.error("Error fetching filtered products:", error.message);
      });
  };

  const handleInputChange = (itemId, field, value) => {
    const qtyBeforeChange = initialQuantities[itemId];

    const roundedValue =
      field === "price" ? parseFloat(value).toFixed(2) : value;

    setOrderProductDTOList((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: parseFloat(roundedValue),
            }
          : item
      )
    );
    setChangesFlag((prev) => !prev);
    if (action === "Edit") {
      if (field === "quantity") {
        const productId = orderProductDTOList.find(
          (item) => item.id === itemId
        )?.productId;
        if (value < qtyBeforeChange) {
          updateSupplyWarnings(productId, qtyBeforeChange, value);
        } else {
          updateSupplyWarnings(productId, qtyBeforeChange, value);
        }
      }
    }
  };

  const handleVatSelect = (itemId, selectedVAT) => {
    setOrderProductDTOList((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, vatRate: selectedVAT } : item
      )
    );
    setChangesFlag((prev) => !prev);
  };

  const getNestedValue = (obj, path) => {
    return path
      ? path.split(".").reduce((acc, part) => acc && acc[part], obj)
      : null;
  };

  return (
    <div className="order-item-list">
      {items.map((item, index) => (
        <div key={`${item.id}-${index}`} className="order-item">
          {attributes.map((attr) => (
            <div
              key={`${item.id}-${attr.name}`}
              className={`order-attribute-item ${
                attr.name === "" ? "order-category-column" : ""
              }`}
              style={{
                width: attr.width,
                justifyItems: attr.justify,
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
                <div className="order-item-list-product-name-with-warning">
                  <TextInput
                    dropdown={true}
                    value={item.productName}
                    displayValue="name"
                    suggestions={productSuggestions[item.id]}
                    onSelect={(selected) => {
                      handleProductNameChange(item.id, selected);
                    }}
                  />
                  {warningVisible[item.id] && (
                    <img
                      src="src/assets/warning.svg"
                      alt="Warning"
                      className="order-item-warning-icon"
                    />
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
                    handleInputChange(item.id, "quantity", value)
                  }
                />
              ) : attr.name === "VAT" ? (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: attr.justify,
                  }}
                >
                  <SelectVATButton
                    selectedVAT={item.vatRate}
                    onSelect={(selectedVAT) =>
                      handleVatSelect(item.id, selectedVAT)
                    }
                  />
                </div>
              ) : attr.name === "Cena" ? (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: attr.justify,
                  }}
                >
                  <span>
                    {isNaN(item.price * item.quantity)
                      ? "0.00"
                      : (item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
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
