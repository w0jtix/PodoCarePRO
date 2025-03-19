import React from "react";
import { useState, useEffect, useRef } from "react";
import DateInput from "./DateInput";
import CostInput from "./CostInput";
import ProductActionButton from "./ProductActionButton";

const EditProductInstanceForm = ({
  category,
  productName,
  number,
  expiryLength,
  productInstances,
  setProductInstances,
  setEditedProductInstances,
  productId,
  onRemoveInstance,
}) => {
  const [expiryDate, setExpiryDate] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [sellingPrice, setSellingPrice] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [initialInstance, setInitialInstance] = useState(null);

  useEffect(() => {
    setInitialInstance({
      id: productInstances[number].id,
      productId: productInstances[number].productId,
      shelfLife:
        category === "Tool"
          ? null
          : category === "Sale"
          ? new Date(productInstances[number].shelfLife)
          : category === "Equipment"
          ? new Date(productInstances[number].warrantyEndDate)
          : null,
      purchaseDate: new Date(productInstances[number].purchaseDate),
      sellingPrice:
        category === "Tool" || category === "Equipment"
          ? undefined
          : productInstances[number].sellingPrice,
    });
    if (category === "Sale") {
      setExpiryDate(productInstances[number].shelfLife ? new Date(productInstances[number].shelfLife) : null);
    } else if (category === "Equipment") {
      setExpiryDate(productInstances[number].warrantyEndDate ? new Date(productInstances[number].warrantyEndDate) : null);
    } else {
      setExpiryDate(null);
    }
    setSellingPrice(productInstances[number].sellingPrice);
    setPurchaseDate(new Date(productInstances[number].purchaseDate ?? null));
  }, [number, category, productInstances.length]);

  const getChangedFields = (initial, edited) => {
    const productInstanceDTO = {};
    Object.keys(initial).forEach((key) => {
      if (JSON.stringify(initial[key]) !== JSON.stringify(edited[key])) {
        productInstanceDTO[key] = edited[key];
      }
    });

    if (Object.keys(productInstanceDTO).length > 0) {
      productInstanceDTO.id = edited.id;
      productInstanceDTO.productId = productId;
    }

    return productInstanceDTO;
  };

  useEffect(() => {
    if (!initialInstance) return;
    const newInstance = {
      id: initialInstance.id,
      productId: initialInstance.productId,
      shelfLife: expiryDate,
      purchaseDate: purchaseDate,
      sellingPrice: sellingPrice,
    };

    let productInstanceDTO = getChangedFields(initialInstance, newInstance);

    if (
      category === "Equipment" &&
      productInstanceDTO.shelfLife !== undefined
    ) {
      productInstanceDTO.warrantyEndDate = productInstanceDTO.shelfLife;
      delete productInstanceDTO.shelfLife;
    }

    if (Object.keys(productInstanceDTO).length > 0) {
      if (initialInstance.id) {
        setEditedProductInstances((prev) => {
          const existingIndex = prev.findIndex(
            (item) => item.id === productInstanceDTO.id
          );

          if (existingIndex !== -1) {
            const updatedInstances = [...prev];
            updatedInstances[existingIndex] = productInstanceDTO;
            return updatedInstances;
          } else {
            return [...prev, productInstanceDTO];
          }
        });
      } else {
        setProductInstances((prev) => {
          const updatedInstances = [...prev];
          updatedInstances[number] = newInstance;
          return updatedInstances;
        });
      }
    }
  }, [initialInstance, expiryDate, purchaseDate, sellingPrice]);

  useEffect(() => {
  }, [expiryDate]);

  const handleExpiryDateChange = (newExpiryDate) => {
    setExpiryDate(newExpiryDate);
    setPurchaseDate(calculatePurchaseDate(newExpiryDate));
  };

  const handlePurchaseDateChange = (newPurchaseDate) => {
    setPurchaseDate(newPurchaseDate);
    if (category !== "Tool") {
      setExpiryDate(calculateExpiryDate(newPurchaseDate));
    }
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

  const handleRemoveInstance = (e) => {
    e.stopPropagation();
    onRemoveInstance(productInstances[number].id, number);
  };

  return (
    <div
      className={`product-instance-form-header ${
        initialInstance?.id ? "" : "new"
      }`}
    >
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
        <ProductActionButton
          src={"src/assets/cancel.svg"}
          alt={"Usuń Produkt"}
          text={"Usuń"}
          disableText={true}
          onClick={(e) => handleRemoveInstance(e)}
        />
      </div>
      {isExpanded && (
        <div className="product-instance-form-info-container">
          <li className="new-product-popup-common-section-row">
            <div className="new-product-popup-common-section-row-div">
              <a className="new-product-popup-field-title">Data zakupu:</a>
              <DateInput
                key={
                  isExpanded
                    ? `expanded-${number}-${purchaseDate}`
                    : `collapsed-${number}`
                }
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
                  selectedCost={sellingPrice}
                  onChange={setSellingPrice}
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
                  key={isExpanded ? `expanded` : `collapsed-${number}`}
                  onChange={handleExpiryDateChange}
                  selectedDate={expiryDate}
                />
              </div>
            </li>
          )}
        </div>
      )}
    </div>
  );
};

export default EditProductInstanceForm;
