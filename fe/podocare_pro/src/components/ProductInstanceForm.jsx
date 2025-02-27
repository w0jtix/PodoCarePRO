import React from "react";
import { useState, useEffect, useRef } from "react";
import DateInput from "./DateInput";
import SelectVATButton from "./SelectVATButton";
import CostInput from "./CostInput";
import SupplierDropdown from "./SupplierDropdown";
import SupplierService from "../service/SupplierService";

const ProductInstanceForm = ({
  category,
  productName,
  number,
  initialSupply,
  expiryLength,
  assignToAll,
  firstInstanceData,
  onAssignToAll,
  onForwardInstanceData,
  productInstances,
}) => {
  const [suppliers, setSuppliers] = useState([]);
  const [expiryDate, setExpiryDate] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState(null);
  const [selectedVAT, setSelectedVAT] = useState(8);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [purchasePrice, setPurchasePrice] = useState(0.0);
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
    setPurchaseDate(null);
    setSelectedVAT(8);
    setSelectedSupplier(null);
    setPurchasePrice(0.0);
  };

  useEffect(() => {
    const instanceDto = {
      id: number,
      supplierId: selectedSupplier?.id,
      purchasePrice: purchasePrice,
      vatRate: selectedVAT,
      netPrice:
        selectedVAT === "zw" || selectedVAT === "np"
          ? purchasePrice
          : purchasePrice / (1 + selectedVAT / 100),
      shelfLife: category === "Tool" ? null : expiryDate,
      purchaseDate:
        category === "Tool"
          ? purchaseDate
          : subtractMonths(expiryDate, expiryLength),
    };
    if (onForwardInstanceData) {
      onForwardInstanceData(instanceDto);
    }
  }, [expiryDate, purchaseDate, selectedVAT, selectedSupplier, purchasePrice]);

  useEffect(() => {
    if (assignToAll && firstInstanceData && number !== 0) {
      category === "Tool"
        ? setPurchaseDate(firstInstanceData.purchaseDate)
        : setExpiryDate(firstInstanceData.shelfLife);
      setSelectedVAT(firstInstanceData.vatRate);
      setSelectedSupplier(firstInstanceData.supplier);
      setPurchasePrice(firstInstanceData.purchasePrice);
    } else if (!assignToAll && number !== 0) {
      setExpiryDate(null);
      setPurchaseDate(null);
      setSelectedVAT(8);
      setSelectedSupplier(null);
      setPurchasePrice(0.0);
    }
  }, [assignToAll, firstInstanceData, number]);

  useEffect(() => {}, [expiryDate]);

  const fetchSuppliers = () => {
    SupplierService.getAllSuppliers()
      .then((response) => {
        const sortedSuppliers = response.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setSuppliers(sortedSuppliers);
      })
      .catch((error) => {
        setSuppliers([]);
        console.error("Error fetching suppliers:", error);
      });
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOnSelectSupplier = (supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleAddSupplier = (newSupplier) => {
    setSuppliers((prevSuppliers) => [...prevSuppliers, newSupplier]);
    setSelectedSupplier(newSupplier);
  };

  const handleExpiryDateChange = (newDate) => {
    setExpiryDate(newDate);
  };

  const handlePurchaseDateChange = (newDate) => {
    setPurchaseDate(newDate);
  };

  const handleVatSelect = (selectedVAT) => {
    setSelectedVAT(selectedVAT);
  };

  function subtractMonths(date, months) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - months);
    return newDate;
  }

  const handleAssignToAllClick = () => {
    if (!assignToAll) {
      const dto = {
        id: number,
        supplier: selectedSupplier,
        purchasePrice: purchasePrice,
        vatRate: selectedVAT,
        netPrice:
          selectedVAT === "zw" || selectedVAT === "np"
            ? purchasePrice
            : purchasePrice / (1 + selectedVAT / 100),
        shelfLife: category === "Tool" ? null : expiryDate,
        purchaseDate:
          category === "Tool"
            ? purchaseDate
            : subtractMonths(expiryDate, expiryLength),
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
        <img
          src="src/assets/arrow_down.svg"
          alt="arrow down"
          className={`arrow-down ${isExpanded ? "rotated" : ""}`}
        />
        <a>{productName !== "" ? `${productName}` : "Produkt"}</a>
      </div>
      {isExpanded && (
        <div className="product-instance-form-info-container">
          <li className="new-product-popup-common-section-row test">
            <div className="new-product-popup-common-section-row-div">
              <SupplierDropdown
                items={suppliers}
                placeholder="Wybierz Sklep"
                selectedSupplier={selectedSupplier}
                onSelect={handleOnSelectSupplier}
                onAddSupplier={handleAddSupplier}
              />
            </div>
            <div className="new-product-popup-common-section-row-div">
              <a className="new-product-popup-field-title">Cena zakupu:</a>
              <CostInput
                startValue={0.0}
                onChange={setPurchasePrice}
                selectedCost={purchasePrice}
              />
            </div>
          </li>
          <li className="new-product-popup-common-section-row vat">
            <div className="new-product-popup-common-section-row-div">
              <a className="new-product-popup-field-title">VAT:</a>
              <SelectVATButton
                selectedVAT={selectedVAT}
                onSelect={(selectedVAT) => handleVatSelect(selectedVAT)}
              />
            </div>
            <div className="new-product-popup-common-section-row-div">
              <a className="new-product-popup-field-title">
                {category === "Tool" ? "Data zakupu:" : "Ważny do:"}
              </a>
              <DateInput
                key={isExpanded ? "expanded" : `collapsed-${number}`}
                onChange={
                  category === "Tool"
                    ? handlePurchaseDateChange
                    : handleExpiryDateChange
                }
                selectedDate={category === "Tool" ? purchaseDate : expiryDate}
              />
            </div>
          </li>
          {number === 0 && initialSupply > 1 && (
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
