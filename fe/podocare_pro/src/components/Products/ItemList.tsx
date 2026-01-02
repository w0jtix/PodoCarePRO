import React, { useCallback } from "react";
import ActionButton from "../ActionButton";
import { useState } from "react";
import { ListAttribute} from "../../constants/list-headers";
import { Product, Unit } from "../../models/product";
import { Action } from "../../models/action";
import CostInput from "../CostInput";

export interface ItemListProps {
  attributes: ListAttribute[];
  items: Product[];
  setEditProductId?: (productId: string | number | null) => void;
  setRemoveProductId?: (productId: string | number | null) => void;
  setIsAddNewProductsPopupOpen?: (isOpen: boolean) => void;
  className?: string;
  action?: Action;
  onClick?: (product: Product) => void;
  onRemoveByIndex?: (index: number) => void;
  productInfo?: boolean;
}

export function ItemList ({
  attributes,
  items,
  setEditProductId,
  setRemoveProductId,
  className = "",
  onClick,
  onRemoveByIndex,
  productInfo = false,
}: ItemListProps) {

  const handleOnClickEdit = useCallback((e: React.MouseEvent, item: Product) => {
    e.stopPropagation();
    setEditProductId?.(item.id);
  }, [setEditProductId]);

  const handleOnClickRemove = useCallback((e: React.MouseEvent, item: Product) => {
    e.stopPropagation();
    setRemoveProductId?.(item.id);
  }, [setRemoveProductId]);

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
        return productInfo ? (
          <div className="flex g-5px align-items-center">
            <span className="product-span">{item.name}</span>
            <span className="ml-1 product-span shadow italic">
              {item.volume ?? " "}{item.unit === Unit.ML ? 'ml' : item.unit === Unit.G ? 'g' : ''}
              
            </span>
            <span className="ml-1 product-span shadow italic">
              {item.sellingPrice && item.volume && item.volume !== 0
                ? ` ${((item.sellingPrice * 100) / item.volume).toFixed(2)} zł/${item.unit === Unit.ML ? '100ml' : item.unit === Unit.G ? '100g' : ''}`
                : ''}
            </span>
          </div>
        ) : item.name;
      
      case "Marka":
        return(<span className="list-span ml-1">{item.brand.name}</span>);

      case "Stan Magazynowy":
        return(<span className="list-span ml-1">{item.supply}</span>);

      case "Cena":
        if (item.category.name != "Produkty" || !item.sellingPrice) {
          return "";
        }
        return(<span className="list-span ml-1">{item.sellingPrice} zł</span>);

      case "empty": 
        return "";

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons flex ml-1">
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
