import React from "react";
import BrandInput from "./BrandInput";
import DigitInput from "./DigitInput";
import CostInput from "./CostInput";
import { useState, useEffect } from "react";
import ProductInstanceForm from "./ProductInstanceForm";
import EditProductInstanceForm from "./EditProductInstanceForm";
import ProductActionButton from "./ProductActionButton";

const ProductForm = ({
  onForwardProductCreationForm,
  selectedCategory,
  setSelectedCategory,
  action,
  selectedProduct,
  setProductCreationDTO,
  setCategoryChanged,
}) => {
  const [supply, setSupply] = useState(selectedProduct?.currentSupply ?? 0);
  const [productName, setProductName] = useState(
    selectedProduct?.productName ?? ""
  );
  const [brandName, setBrandName] = useState(
    selectedProduct?.brand.brandName ?? null
  );
  const [suggestedSellingPrice, setsuggestedSellingPrice] = useState(
    selectedProduct?.sellingPrice ?? 0
  );
  const [expiryLength, setExpiryLength] = useState(
    (selectedProduct?.category === "Equipment"
      ? selectedProduct?.warrantyLength
      : selectedProduct?.estimatedShelfLife) ?? 24
  );
  const [description, setDescription] = useState(
    selectedProduct?.description ?? null
  );
  const [assignToAll, setAssignToAll] = useState(false);
  const [firstInstanceData, setFirstInstanceData] = useState(null);
  const [productInstances, setProductInstances] = useState(
    selectedProduct?.productInstances.sort((a, b) => a.id - b.id) ?? []
  );
  const [editedProductInstances, setEditedProductInstances] = useState([]);
  const [instanceIdsToBeRemoved, setInstancesToBeRemoved] = useState([]);

  const categories = ["Sale", "Tool", "Equipment"];
  const categoryMap = {
    Sale: "Produkty",
    Tool: "Narzędzia",
    Equipment: "Sprzęt",
  };

  const handleAssignToAll = (dto) => {
    setAssignToAll((prev) => !prev);
    if (!assignToAll) {
      setFirstInstanceData(dto);
    } else {
      setFirstInstanceData(null);
    }
  };

  useEffect(() => {
    if (action === "Create") {
      resetProductInstanceForm();
    }
  }, [selectedCategory, selectedProduct]);

  const handleCategoryChange = (category) => {
    /* if (action === "Edit") {
      const categoryHasBeenEdited = category !== selectedProduct.category;

      categoryHasBeenEdited
        ? setCategoryChanged(true)
        : setCategoryChanged(false);

      if (category === "Equipment" && categoryHasBeenEdited) {
        const updatedProductInstances = productInstances.map((instance) => {
          if (instance.shelfLife) {
            // Sale -> Eq
            return {
              ...instance,
              warrantyEndDate: new Date(instance.shelfLife),
            };
          } else {
            // Tool -> Eq
            return {
              ...instance,
              warrantyEndDate: calculateExpiryDateByPurchaseDate(expiryLength, instance.purchaseDate),
            };
          }
        });
        setProductInstances(updatedProductInstances);
      } else if (category === "Sale" && categoryHasBeenEdited) {
        const updatedProductInstances = productInstances.map((instance) => {
          if (instance.warrantyEndDate) {
            // Eq -> Sale
            return {
              ...instance,
              warrantyEndDate: new Date(instance.warrantyEndDate),
            };
          } else {
            // Tool -> Sale
            return {
              ...instance,
              shelfLife: calculateExpiryDateByPurchaseDate(expiryLength, instance.purchaseDate),
            };
          }
        });
        setProductInstances(updatedProductInstances);
      }
    } */
    if (action === "Create") {
      setSelectedCategory(category);
    }
  };

  const resetProductInstanceForm = () => {
    setSupply(selectedProduct?.currentSupply ?? 0);
    setProductName(selectedProduct?.productName ?? "");
    setBrandName(selectedProduct?.brand.brandName ?? null);
    setsuggestedSellingPrice(selectedProduct?.sellingPrice ?? 0);
    setExpiryLength(selectedProduct?.estimatedShelfLife ?? 24);
    setDescription(selectedProduct?.description ?? null);
    setAssignToAll(false);
    setFirstInstanceData(null);
    setProductInstances([]);
  };

  const handleEditedInstanceData = (instance) => {
    setEditedProductInstances((prev) => [...prev, instance]);
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

  const handleRemoveInstance = (instanceId, number) => {
    if (instanceId) {
      setInstancesToBeRemoved((prev) => [...prev, instanceId]);
      setProductInstances((prevInstances) =>
        prevInstances.filter((instance) => instance.id !== instanceId)
      );
    } else {
      setProductInstances((prevInstances) =>
        prevInstances.filter((_, index) => index !== number)
      );
    }
  };

  const handleAddInstance = () => {
    const newInstance = {
      id: null,
      productId: selectedProduct.id,
      purchaseDate: new Date(),
    };
    if (selectedCategory === "Sale") {
      newInstance.shelfLife = calculateExpiryDate(expiryLength);
      newInstance.sellingPrice = selectedProduct.sellingPrice;
    } else if (selectedCategory === "Equipment") {
      newInstance.warrantyEndDate = calculateExpiryDate(expiryLength);
    }
    setProductInstances((prev) => [...prev, newInstance]);
  };

  /*   const calculateExpiryDateByPurchaseDate = (estimatedShelfLife, purchaseDate) => {
    const newDate = new Date(purchaseDate);
    newDate.setMonth(newDate.getMonth() + estimatedShelfLife);
    return newDate;
  } */

  const calculateExpiryDate = (estimatedShelfLife) => {
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() + estimatedShelfLife);
    return newDate;
  };

  const renderInstances = (action) => {
    let instances = [];
    for (
      let i = 0;
      i < (action === "Create" ? supply : productInstances.length);
      i++
    ) {
      if (action === "Create") {
        instances.push(
          <ProductInstanceForm
            key={i}
            category={selectedCategory}
            productName={productName}
            number={i}
            supply={supply}
            expiryLength={expiryLength}
            suggestedSellingPrice={suggestedSellingPrice}
            assignToAll={assignToAll}
            firstInstanceData={firstInstanceData}
            onAssignToAll={i === 0 ? handleAssignToAll : undefined}
            onForwardInstanceData={handleInstanceData}
            productInstances={productInstances}
          />
        );
      } else if (action === "Edit") {
        instances.push(
          <EditProductInstanceForm
            key={i}
            category={selectedCategory}
            productName={productName}
            number={i}
            supply={supply}
            expiryLength={expiryLength}
            onForwardInstanceData={handleEditedInstanceData}
            productInstances={productInstances}
            setProductInstances={setProductInstances}
            setEditedProductInstances={setEditedProductInstances}
            productId={selectedProduct.id}
            onRemoveInstance={handleRemoveInstance}
            onAddInstance={handleAddInstance}
          />
        );
      }
    }
    return instances;
  };

  const handleBrand = (brandName) => {
    setBrandName(brandName);
  };

  const getChangedFields = (initial, edited) => {
    const productCreationDTO = {};
    Object.keys(initial).forEach((key) => {
      if (JSON.stringify(initial[key]) !== JSON.stringify(edited[key])) {
        productCreationDTO[key] = edited[key];
      }
    });

    if (Object.keys(productCreationDTO).length > 0) {
      productCreationDTO.id = selectedProduct.id;
      if (!productCreationDTO.hasOwnProperty("category")) {
        productCreationDTO.category = selectedCategory;
      }
    }

    return productCreationDTO;
  };

  useEffect(() => {
    let productForm = {};
    if (action === "Edit") {
      const initialProduct = {
        name: selectedProduct.productName,
        brandName: selectedProduct.brand.brandName,
        estimatedShelfLife:
          (selectedProduct?.category === "Equipment"
            ? selectedProduct?.warrantyLength
            : selectedProduct?.estimatedShelfLife) ?? 24,
        estimatedSellingPrice: selectedProduct.sellingPrice ?? 0,
        description: selectedProduct.description,
        saleProductInstances: [],
        toolProductInstances: [],
        equipmentProductInstances: [],
        instanceIdsToBeRemoved: [],
      };
      const editedProduct = {
        name: productName,
        brandName: brandName,
        estimatedShelfLife: expiryLength,
        estimatedSellingPrice:
          selectedCategory === "Sale" ? suggestedSellingPrice : 0,
        description: description,
        saleProductInstances:
          selectedCategory === "Sale"
            ? [
                ...editedProductInstances,
                ...productInstances.filter((instance) => instance.id === null), //new-created instances
              ]
            : [],
        toolProductInstances:
          selectedCategory === "Tool"
            ? [
                ...editedProductInstances,
                ...productInstances.filter((instance) => instance.id === null), //new-created instances
              ]
            : [],
        equipmentProductInstances:
          selectedCategory === "Equipment"
            ? [
                ...editedProductInstances,
                ...productInstances.filter((instance) => instance.id === null), //new-created instances
              ]
            : [],
        instanceIdsToBeRemoved: instanceIdsToBeRemoved,
      };

      productForm = getChangedFields(initialProduct, editedProduct);
      setProductCreationDTO(productForm);
    } else if (action === "Create") {
      productForm = {
        name: productName,
        brandName: brandName,
        estimatedShelfLife: expiryLength,
        category: selectedCategory,
        estimatedSellingPrice: suggestedSellingPrice,
        description: description,
        saleProductInstances:
          selectedCategory === "Sale" ? productInstances : null,
        toolProductInstances:
          selectedCategory === "Tool" ? productInstances : null,
        equipmentProductInstances:
          selectedCategory === "Equipment" ? productInstances : null,
      };
      onForwardProductCreationForm(productForm);
    }
  }, [
    productName,
    brandName,
    suggestedSellingPrice,
    expiryLength,
    productInstances,
    editedProductInstances,
    description,
    instanceIdsToBeRemoved,
  ]);

  return (
    <div className={`product-form-container ${action.toLowerCase()}`}>
      <section className="order-new-products-popup-action-keys-section add-product">
        <a className="new-product-popup-field-title">Kategoria:</a>
        <div className="order-new-products-popup-category-buttons">
          {categories.map((category) => (
            <button
              key={category}
              className={`order-new-products-popup-category-button ${category.toLowerCase()} ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              <h2 className="order-new-products-popup-category-button-h2">
                {categoryMap[category]}
              </h2>
            </button>
          ))}
        </div>
      </section>
      <section className="product-form-core-section">
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
          {(selectedCategory === "Sale" ||
            selectedCategory === "Equipment") && (
            <>
              <li className="new-product-popup-common-section-row digit-inputs">
                <a className="new-product-popup-field-title">
                  {selectedCategory === "Sale"
                    ? "Szacowany okres ważności:"
                    : "Okres gwarancji:"}
                </a>
                <DigitInput
                  startValue={expiryLength}
                  onInputValue={(value) => setExpiryLength(value)}
                />
              </li>
              {selectedCategory === "Sale" && (
                <li className="new-product-popup-common-section-row digit-inputs">
                  <a className="new-product-popup-field-title">
                    Przewidywana cena sprzedaży:
                  </a>
                  <CostInput
                    startValue={0.0}
                    onChange={setsuggestedSellingPrice}
                    selectedCost={suggestedSellingPrice}
                  />
                </li>
              )}
            </>
          )}
          {action === "Create" && (
            <li className="new-product-popup-common-section-row">
              <a className="new-product-popup-field-title">
                Produkty na stanie:
              </a>
              <DigitInput
                onInputValue={(initSupply) => {
                  setSupply(initSupply);

                  setProductInstances((prevInstances) =>
                    prevInstances.slice(0, initSupply)
                  );

                  if (initSupply === 0) {
                    setAssignToAll(false);
                  }
                }}
                startValue={supply}
              />
            </li>
          )}
          <li className="new-product-popup-common-section-row description">
            <a className="new-product-popup-field-title">
              Dodatkowe informacje:
            </a>
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
                Produkty na stanie: <span>{productInstances.length}</span>
              </a>
            }{" "}
            {action === "Edit" && (
              <ProductActionButton
                src={"src/assets/addNew.svg"}
                alt={"Dodaj Produkt"}
                disableText={true}
                onClick={() => handleAddInstance()}
              />
            )}
          </div>
          {supply >= 0 && <div>{renderInstances(action)}</div>}
        </div>
      </section>
    </div>
  );
};

export default ProductForm;
