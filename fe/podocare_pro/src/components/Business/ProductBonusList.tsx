import React, { useState, useEffect } from "react";
import { ListAttribute, BONUS_PRODUCT_CONTENT_LIST_ATTRIBUTES } from "../../constants/list-headers";
import { BonusProduct } from "../../models/employee";
import ProductBonusContent from "./ProductBonusContent";
import arrowDownIcon from "../../assets/arrow_down.svg";
import alertIcon from "../../assets/alert.svg";

export interface ProductBonusListProps {
  attributes: ListAttribute[];
  items: BonusProduct[];
  className?: string;
}

export function ProductBonusList ({
  attributes,
  items,
  className = "",
}: ProductBonusListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (productId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  useEffect(() => {
    setExpandedIds(new Set());
  }, [items]);

  const renderAttributeContent = (
    attr: ListAttribute,
    item: BonusProduct,
  ): React.ReactNode => {
    switch (attr.name) {

      case "":
        return (
          <img
            src={arrowDownIcon}
            alt="arrow down"
            className={`arrow-down ${expandedIds.has(item.productId) ? "rotated" : ""}`}
          />
        );

      case "Nazwa":
        return (
          <div className="flex g-1">
            <span className="order-values-lower-font-size">{item.productName}</span>
            <span className="order-brand-span flex text-align-center italic">{item.brandName}</span>
            {item.noPurchaseHistory && item.fallbackPurchasePriceUsed && (
              
                <img
                  title="Brak historii zakupów — użyto awaryjnej ceny zakupu Netto przypisanej do produktu. Marża i premia mogą być niedokładne."
                  src={alertIcon}
                  alt="alert"
                  className="sb-alert"
                />
            )}
            {item.noPurchaseHistory && !item.fallbackPurchasePriceUsed && (
              <>
                <img
                  title="Brak historii zakupów tego produktu. Brak możliwości naliczenia marży i premii."
                  src={alertIcon}
                  alt="alert"
                  className="sb-alert"
                />
              <img
                title="Brak historii zakupów tego produktu. Brak możliwości naliczenia marży i premii."
                src={alertIcon}
                alt="alert"
                className="sb-alert"
              />
              </>
            )}
          </div>
        );

      case "Ilość":
        return(<span className="order-values-lower-font-size">
            {item.quantitySold}
          </span>);

      case "Bonus":
        return(<span className={`order-values-lower-font-size add bold ${(item.noPurchaseHistory && item.fallbackPurchasePriceUsed) ?  "notify" : (item.noPurchaseHistory && !item.fallbackPurchasePriceUsed) ? "alert" : ""}`}>
            + {item.totalBonus}zł
          </span>);

      default:
        return <span>{"-"}</span>;
    }
  };

  if (items.length === 0) {
    return (
      <div className={`item-list width-93 p-0 mt-05 g-5px ${className} flex align-items-center justify-center`}>
        <span className="qv-span opacity-half italic">Brak sprzedaży w tym miesiącu</span>
      </div>
    );
  }

  return (
    <div
    className={`item-list flex-column width-93 p-0 mt-05 g-5px ${className}`}
    >
      {items.map((item, index) => (
        <div key={index} className={`product-wrapper width-max ${className}`}>
          <div
            className={`item flex ${className} ${item.noPurchaseHistory ? (item.fallbackPurchasePriceUsed ? "notify" : "alert") : ""} pointer`}
            onClick={() => toggleExpand(item.productId)}
          >
            {attributes.map((attr) => (
              <div
                key={`${index}-${attr.name}`}
                className={`attribute-item flex ${
                  attr.name === "" ? "category-column" : "align-self-center"
                } ${className}`}
                style={{
                  width: attr.width,
                  justifyContent: attr.justify,
                }}
              >
                {renderAttributeContent(attr, item)}
                </div>
            ))}
          </div>
          {expandedIds.has(item.productId) && (
            <ProductBonusContent
              product={item}
              attributes={BONUS_PRODUCT_CONTENT_LIST_ATTRIBUTES}
              className={className}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductBonusList;
