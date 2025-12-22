import React, { useCallback } from "react";
import ActionButton from "../ActionButton";
import { useState } from "react";
import { ListAttribute} from "../../constants/list-headers";
import { Product } from "../../models/product";
import { Action } from "../../models/action";
import CostInput from "../CostInput";

export interface ItemListProps {
  attributes: ListAttribute[];
  items: Product[];
  setIsEditProductsPopupOpen?: (isOpen: boolean) => void;
  setRemoveProductId?: (productId: string | number | null) => void;
  setSelectedProduct?: (product: Product | null) => void;
  setIsAddNewProductsPopupOpen?: (isOpen: boolean) => void;
  className?: string;
  action?: Action;
  onClick?: (product: Product) => void;
  onRemoveByIndex?: (index: number) => void;
}

export function ItemList ({
  attributes,
  items,
  setIsEditProductsPopupOpen,
  setRemoveProductId,
  setSelectedProduct,
  className = "",
  onClick,
  onRemoveByIndex,
}: ItemListProps) {

  const handleOnClickEdit = useCallback((e: React.MouseEvent, item: Product) => {
    e.stopPropagation();
    setSelectedProduct?.(item);
    setIsEditProductsPopupOpen?.(true);
  }, [setSelectedProduct, setIsEditProductsPopupOpen]);

  const handleOnClickRemove = useCallback((e: React.MouseEvent, item: Product) => {
    e.stopPropagation();
    setSelectedProduct?.(item);
    setRemoveProductId?.(item.id);
  }, [setSelectedProduct, setRemoveProductId]);

  const toggleProducts = (item : Product) => {
    onClick?.(item);
  };

  const renderAttributeContent = (
    attr: ListAttribute,
    item: Product,
    index: number,
  ): React.ReactNode => {
    switch (attr.name) {
      case "#":
        return index + 1;

      case "":
        return (
          <div
          className="category-container width-40 p-0"
          style={{
            backgroundColor: item.category?.color
                      ? `rgb(${item.category.color})`
                      : undefined
          }}
          />
        );

      case "Nazwa":
        return `${item.name}`;
      
      case "Marka":
        return`${item.brand.name}`;

      case "Stan Magazynowy":
        return `${item.supply}`;

      case "Cena":
        return `${item.sellingPrice ?? 0} zł`;

      case "empty": 
        return "";

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons flex">
            <ActionButton
              src="src/assets/edit.svg"
              alt="Edytuj Produkt"
              iconTitle={"Edytuj Produkt"}
              text="Edytuj"
              onClick={(e) => handleOnClickEdit(e, item)}
              disableText={true}
              disabled={item.isDeleted}
              />
              <ActionButton
              src="src/assets/cancel.svg"
              alt="Usuń Produkt"
              iconTitle={"Usuń Produkt"}
              text="Usuń"
              onClick={(e) => handleOnClickRemove(e, item)}
              disableText={true}
              disabled={item.isDeleted}
            />
          </div>
        );
      default:
        return <span>{"-"}</span>;
    }
  };

  return (
    <div className={`item-list width-max grid p-0 ${items.length === 0 ? "border-none" : ""} ${className}`}>
      {items.map((item, index) => (
        <div key={item.id} className={`product-wrapper ${className}`}>
          <div
            className={`item flex ${!item.isDeleted ? "pointer" : ""} ${className}`}
            onClick={() => !item.isDeleted && toggleProducts(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !item.isDeleted) {
                toggleProducts(item);
              }
            }}
          >
            {attributes.map((attr) => (
              <div
                key={`${item.id}-${attr.name}`}
                className={`attribute-item flex ${
                  attr.name === "" ? "category-column" : "align-self-center"
                } ${className}`}
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
