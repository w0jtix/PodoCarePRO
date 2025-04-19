import React from "react";
import ProductActionButton from "./ProductActionButton";
import { useState } from "react";
import ProductContent from "./ProductContent";


const ItemList = ({
  attributes,
  items,
  currentPage,
  itemsPerPage,
  setIsEditProductsPopupOpen,
  setIsRemoveProductsPopupOpen,
  setSelectedProduct,
}) => {
  const [expandedProductIds, setExpandedProductIds] = useState([]);

  const attributeMap = {
    Nazwa: "productName",
    Marka: "brandName",
    "Stan Magazynowy": "productInstances.length",
  };

  const categoryColors = {
    Sale: "rgb(0, 253, 0)",
    Tool: "rgb(253, 173, 0)",
    Equipment: "rgb(253, 0, 190)",
  };

  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  const handleOnClickEdit = (e, item) => {
    e.stopPropagation();
    setIsEditProductsPopupOpen(true);
    setSelectedProduct(item);
  };

  const handleOnClickRemove = (e, item) => {
    e.stopPropagation();
    setSelectedProduct(item);
    setIsRemoveProductsPopupOpen(true);
  }

  const toggleProducts = (productId) => {
    setExpandedProductIds((prevIds) =>
      prevIds.includes(productId)
        ? prevIds.filter((id) => id !== productId)
        : [...prevIds, productId]
    );
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  return (
    <div className={`item-list ${items.length === 0 ? "is-empty" : ""}`}>
      {items.map((item, index) => (
        <div key={`${item.id}-${item.productName}`} className="product-wrapper">
          <div
            className={`item ${
              item.productInstances.length > 0 ? "pointer" : ""
            }`}
            onClick={() => toggleProducts(item.id)}
          >
            {attributes.map((attr) => (
              <div
                key={`${item.id}-${attr.name}`}
                className={`attribute-item ${
                  attr.name === "" ? "category-column" : ""
                }`}
                style={{
                  width: attr.width,
                  justifyContent: attr.justify,
                }}
              >
                {attr.name === "#" ? (
                  startIndex + index + 1
                ) : attr.name === "" ? (
                  <div
                    className="category-container"
                    style={{
                      backgroundColor: categoryColors[item.category],
                    }}
                  ></div>
                ) : attr.name === "Opcje" ? (
                  <div className="item-list-single-item-action-buttons">
                    <ProductActionButton
                      src={"src/assets/edit.svg"}
                      alt={"Edytuj Produkt"}
                      text={"Edytuj"}
                      onClick={(e) => handleOnClickEdit(e, item)}
                      disableText={true}
                    />
                    <ProductActionButton
                      src={"src/assets/cancel.svg"}
                      alt={"Usuń Produkt"}
                      text={"Usuń"}
                      onClick={(e) => handleOnClickRemove(e, item)}
                      disableText={true}
                    />
                  </div>
                ) : (
                  getNestedValue(item, attributeMap[attr.name])
                )}
              </div>
            ))}
          </div>
          {expandedProductIds.includes(item.id) && (
            <ProductContent product={item} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ItemList;
