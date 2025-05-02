import React from "react";
import { useState, useEffect, useRef } from "react";
import DateInput from "./DateInput";
import CostInput from "./CostInput";


const ProductInstanceForm = ({
  category,
  productName,
  number,
  supply,
  suggestedSellingPrice,
  expiryLength,
  assignToAll,
  firstInstanceData,
  onAssignToAll,
  onForwardInstanceData,
  productInstances,
}) => {
  const [expiryDate, setExpiryDate] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [sellingPrice, setSellingPrice] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (productInstances.size === 0) {
      resetProductInstanceForm();
    }
  }, [productInstances, category]);

  useEffect(() => {
    resetProductInstanceForm();
  }, [category]);

  const resetProductInstanceForm = () => {
    setExpiryDate(null);
    setPurchaseDate(new Date());
    setSellingPrice(0);
  };

  useEffect(() => {
    const instanceDto = {
      id: number,
      shelfLife: category === "Tool" ? null : expiryDate,
      purchaseDate: purchaseDate,
      sellingPrice: sellingPrice,
    };
    if (onForwardInstanceData) {
      onForwardInstanceData(instanceDto);
    }
  }, [expiryDate, purchaseDate, sellingPrice]);

  useEffect(() => {
    if (assignToAll && firstInstanceData && number !== 0) {
      if (category === "Sale") {
        setSellingPrice(firstInstanceData.sellingPrice);
        setExpiryDate(firstInstanceData.shelfLife);
      } else if (category === "Equipment") {
        setExpiryDate(firstInstanceData.shelfLife);
      }
      setPurchaseDate(firstInstanceData.purchaseDate);
    }
  }, [assignToAll, firstInstanceData, number]);

  useEffect(() => {}, [expiryDate]);

  const handleExpiryDateChange = (newExpiryDate) => {
    setExpiryDate(newExpiryDate);
    setPurchaseDate(calculatePurchaseDate(newExpiryDate));
  };

  const handlePurchaseDateChange = (newPurchaseDate) => {
    setPurchaseDate(newPurchaseDate);
    setExpiryDate(calculateExpiryDate(newPurchaseDate));
  };

  const calculatePurchaseDate = (expiry) => {
    const newDate = new Date(expiry);
    newDate.setMonth(newDate.getMonth() - expiryLength);
    return newDate;
  };

  const calculateExpiryDate = (purchase) => {
    const newDate = new Date(purchase);
    newDate.setMonth(newDate.getMonth() + expiryLength);
    return newDate;
  };

  useEffect(() => {
    setExpiryDate(calculateExpiryDate(purchaseDate));
    setSellingPrice(suggestedSellingPrice);
  }, []);

  const handleAssignToAllClick = () => {
    if (!assignToAll) {
      const dto = {
        id: number,
        shelfLife: category === "Tool" ? null : expiryDate,
        purchaseDate: purchaseDate,
        sellingPrice: sellingPrice,
      };
      onAssignToAll(dto);
    } else {
      onAssignToAll(null);
    }
  };

  return (
    <div className="product-instance-form-header">
      <div
        className="product-instance-form-header-title"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <section className="product-instance-form-header-title-section">
          <img
            src="src/assets/arrow_down.svg"
            alt="arrow down"
            className={`arrow-down ${isExpanded ? "rotated" : ""}`}
          />
          <a>{productName !== "" ? `${productName}` : "Produkt"}</a>
        </section>
      </div>
      {isExpanded && (
        <div className="product-instance-form-info-container">
          <li className="new-product-popup-common-section-row">
            <div className="new-product-popup-common-section-row-div">
              <a className="new-product-popup-field-title">Data zakupu:</a>
              <DateInput
                key={isExpanded ? "expanded" : `collapsed-${number}`}
                onChange={handlePurchaseDateChange}
                selectedDate={purchaseDate}
              />
            </div>
          </li>
          {category === "Sale" && (
            <li className="new-product-popup-common-section-row">
              <div className="new-product-popup-common-section-row-div">
                <a className="new-product-popup-field-title">Cena sprzedaży:</a>
                <CostInput
                  startValue={0.0}
                  onChange={setSellingPrice}
                  selectedCost={sellingPrice}
                />
              </div>
            </li>
          )}
          {(category === "Sale" || category === "Equipment") && (
            <li className="new-product-popup-common-section-row">
              <div className="new-product-popup-common-section-row-div">
                <a className="new-product-popup-field-title">
                  {category === "Sale" ? "Ważny do:" : "Gwarancja do: "}
                </a>
                <DateInput
                  key={isExpanded ? "expanded" : `collapsed-${number}`}
                  onChange={handleExpiryDateChange}
                  selectedDate={expiryDate}
                />
              </div>
            </li>
          )}

          {number === 0 && supply > 1 && (
            <button
              className={`new-product-popup-assign-to-all-button ${
                assignToAll ? "selected" : ""
              }`}
              onClick={handleAssignToAllClick}
            >
              Przypisz do wsztkich
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductInstanceForm;
