import React from "react";
import BrandInput from "./BrandInput";
import DigitInput from "./DigitInput";
import CostInput from "./CostInput";
import { useState, useEffect } from "react";
import ProductInstanceForm from "./ProductInstanceForm";

const ProductForm = ({ onForwardProductCreationForm, category }) => {
  const [initialSupply, setInitialSupply] = useState(0);
  const [productName, setProductName] = useState("");
  const [brandName, setBrandName] = useState(null);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [expiryLength, setExpiryLength] = useState(24);
  const [description, setDescription] = useState(null);
  const [assignToAll, setAssignToAll] = useState(false);
  const [firstInstanceData, setFirstInstanceData] = useState(null);
  const [productInstances, setProductInstances] = useState([]);

  const handleAssignToAll = (dto) => {
    setAssignToAll((prev) => !prev);
    if (!assignToAll) {
      setFirstInstanceData(dto);
    } else {
      setFirstInstanceData(null);
    }
  };

  useEffect(() => {
    resetSaleProductInstanceForm();
  }, [category]);

  const resetSaleProductInstanceForm = () => {
    setInitialSupply(0);
    setProductName("");
    setBrandName(null);
    setSellingPrice(0);
    setExpiryLength(24);
    setDescription(null);
    setAssignToAll(false);
    setFirstInstanceData(null);
    setProductInstances([]);
  };

  const handleInstanceData = (instance) => {
    setProductInstances((prev) => {
      const index = prev.findIndex((item) => item.id === instance.id);
      if (index !== -1) {
        const updatedInstances = [...prev];
        updatedInstances[index] = instance;
        return updatedInstances;
      } else {
        return [...prev, instance];
      }
    });
  };

  const renderInstances = () => {
    let instances = [];
    for (let i = 0; i < initialSupply; i++) {
      instances.push(
        <ProductInstanceForm
          key={i}
          category={category}
          productName={productName}
          number={i}
          initialSupply={initialSupply}
          expiryLength={expiryLength}
          assignToAll={assignToAll}
          firstInstanceData={firstInstanceData}
          onAssignToAll={i === 0 ? handleAssignToAll : undefined}
          onForwardInstanceData={handleInstanceData}
          productInstances={productInstances}
        />
      );
    }
    return instances;
  };

  const handleBrand = (brandName) => {
    setBrandName(brandName);
  };

  useEffect(() => {
    const productForm = {
      name: productName,
      brandName: brandName,
      shelfLife: expiryLength,
      category: category,
      sellingPrice: sellingPrice,
      description: description,
      saleProductInstances: category === "Sale" ? productInstances : null,
      toolProductInstances: category === "Tool" ? productInstances : null,
      equipmentProductInstances: category === "Equipment" ? productInstances : null,
    };
    onForwardProductCreationForm(productForm);
  }, [
    productName,
    brandName,
    sellingPrice,
    expiryLength,
    productInstances,
    description,
  ]);

  return (
    <div className="product-form-container">
      <ul className="new-product-popup-common-section">
        <li className="new-product-popup-common-section-row">
          <a className="new-product-popup-field-title">Nazwa:</a>
          <input
            type="text"
            className="new-product-popup-input product-name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder=""
          />
        </li>
        <li className="new-product-popup-common-section-row">
          <a className="new-product-popup-field-title">Marka Produktu:</a>
          <BrandInput
            onBrandSelect={(brandName) => handleBrand(brandName)}
            brandName={brandName}
            
          />
        </li>
        {(category === "Sale" || category === "Equipment") && (
          <>
            <li className="new-product-popup-common-section-row digit-inputs">
              <a className="new-product-popup-field-title">
                Szacowany okres ważności:
              </a>
              <DigitInput
                startValue={24}
                onInputValue={(value) => setExpiryLength(value)}
                defaultValue={expiryLength === 24 ? true : false}
              />
            </li>
            <li className="new-product-popup-common-section-row digit-inputs">
              <a className="new-product-popup-field-title">
                Przewidywana cena sprzedaży:
              </a>
              <CostInput startValue={0.0} onChange={setSellingPrice} selectedCost={sellingPrice}/>
            </li>
          </>
        )}

        <li className="new-product-popup-common-section-row">
          <a className="new-product-popup-field-title">Produkty na stanie:</a>
          <DigitInput
            onInputValue={(initSupply) =>
              initSupply === 0
                ? (setInitialSupply(initSupply),
                  setProductInstances([]),
                  setAssignToAll(false))
                : setInitialSupply(initSupply)
            }
            startValue={initialSupply}
            defaultValue={initialSupply === 0 ? true : false}
          />
        </li>

        <li className="new-product-popup-common-section-row description">
          <a className="new-product-popup-field-title">Dodatkowe informacje:</a>
          <textarea
            type="text"
            className="new-product-popup-input description"
            placeholder=""
            rows="4"
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
          />
        </li>
      </ul>
      <div className="product-form-instances-display">
        <div className="product-form-instances-header">
          {
            <a>
              Produkty na stanie: <span>{initialSupply}</span>
            </a>
          }
        </div>
        {initialSupply > 0 && <div>{renderInstances()}</div>}
      </div>
    </div>
  );
};

export default ProductForm;
