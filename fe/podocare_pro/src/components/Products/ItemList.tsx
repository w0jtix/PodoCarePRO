import React, { useCallback } from "react";
import ActionButton from "../ActionButton";
import { useState } from "react";
import { ListAttribute, PRODUCT_LIST_ATTRIBUTE_MAP  } from "../../constants/list-headers";
import { Product } from "../../models/product";

export interface ItemListProps {
  attributes: ListAttribute[];
  items: Product[];
  currentPage: number;
  itemsPerPage: number;
  setIsEditProductsPopupOpen: (isOpen: boolean) => void;
  setIsRemoveProductsPopupOpen: (isOpen: boolean) => void;
  setSelectedProduct: (product: Product | null) => void;
  setIsAddNewProductsPopupOpen?: (isOpen: boolean) => void;
  className?: string;
}

export function ItemList ({
  attributes,
  items,
  currentPage,
  itemsPerPage,
  setIsEditProductsPopupOpen,
  setIsRemoveProductsPopupOpen,
  setSelectedProduct,
  className = ""
}: ItemListProps) {
  const [expandedProductIds, setExpandedProductIds] = useState<number[]>([]);

  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  const handleOnClickEdit = useCallback((e: React.MouseEvent, item: Product) => {
    e.stopPropagation();
    setSelectedProduct(item);
    setIsEditProductsPopupOpen(true);
  }, [setSelectedProduct, setIsEditProductsPopupOpen]);

  const handleOnClickRemove = useCallback((e: React.MouseEvent, item: Product) => {
    e.stopPropagation();
    setSelectedProduct(item);
    setIsRemoveProductsPopupOpen(true);
  }, [setSelectedProduct, setIsRemoveProductsPopupOpen]);

  const toggleProducts = (productId: number) => {
    setExpandedProductIds((prevIds) =>
      prevIds.includes(productId)
        ? prevIds.filter((id) => id !== productId)
        : [...prevIds, productId]
    );
  };

  const startIndex = (currentPage - 1) * itemsPerPage;

  const renderAttributeContent = (
    attr: ListAttribute,
    item: Product,
    index: number,
  ): React.ReactNode => {
    switch (attr.name) {
      case "#":
        return startIndex + index + 1;

      case "":
        return (
          <div
          className="category-container"
          style={{
            backgroundColor: item.category?.color
                      ? `rgb(${item.category.color})`
                      : undefined
          }}
          />
        );
        
      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons">
            <ActionButton
              src="src/assets/edit.svg"
              alt="Edytuj Produkt"
              text="Edytuj"
              onClick={(e) => handleOnClickEdit(e, item)}
              disableText={true}
              disabled={item.isDeleted}
              />
              <ActionButton
              src="src/assets/cancel.svg"
              alt="Usuń Produkt"
              text="Usuń"
              onClick={(e) => handleOnClickRemove(e, item)}
              disableText={true}
              disabled={item.isDeleted}
            />
          </div>
        );
      default:
        const path = PRODUCT_LIST_ATTRIBUTE_MAP[attr.name as keyof typeof PRODUCT_LIST_ATTRIBUTE_MAP];
        return path ? getNestedValue(item, path) : null;  
    }
  };

  return (
    <div className={`item-list ${items.length === 0 ? "is-empty" : ""} ${className}`}>
      {items.map((item, index) => (
        <div key={item.id} className="product-wrapper">
          <div
            className={`item ${!item.isDeleted ? "pointer" : ""}`}
            onClick={() => !item.isDeleted && toggleProducts(item.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !item.isDeleted) {
                toggleProducts(item.id);
              }
            }}
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
                {renderAttributeContent(attr, item, index)}
                </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItemList;
