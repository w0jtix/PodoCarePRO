import React, { useCallback, useEffect } from "react";
import ActionButton from "../ActionButton";
import { useState } from "react";
import { ListAttribute} from "../../constants/list-headers";
import { BaseService, ServiceVariant } from "../../models/service";

export interface VariantsListProps {
  attributes: ListAttribute[];
  items: ServiceVariant[] | BaseService[];
  setSelectedVariant?: (variant: ServiceVariant | BaseService | null) => void;
  selectedVariant?: ServiceVariant | null;
  className?: string;
}

export function VariantsList({
  attributes,
  items,
  setSelectedVariant,
  selectedVariant,
  className = "",
}: VariantsListProps) {


  const renderAttributeContent = (
    attr: ListAttribute,
    item: ServiceVariant,
    index?: number,
  ): React.ReactNode => {
    switch (attr.name) {

      case "empty":
        return ` `;
      case "Nazwa":
        return `${item.name}`;

      case "Czas":
        return `${item.duration} min`;

      case "Cena":
        return `${item.price} zł`;

      default:
        return <span>{"-"}</span>;
    }
  };

  return (
    <div
      className={`item-list width-max grid p-0 ${
        items.length === 0 ? "border-none" : ""
      } ${className}`}
      
    >
      {items.map((item, index) => (
        <div key={`${item.id}-${index}`} className={`product-wrapper ${className} ${item.id === selectedVariant?.id ? "selected" : ""}`}>
          <div
            className={`item align-items-center pointer flex ${className} ${item.id === selectedVariant?.id ? "selected" : ""}`}
            onClick={() => setSelectedVariant?.(item)}
          >
            {attributes.map((attr) => (
              <div
                key={`${item.id}-${attr.name}`}
                className={`attribute-item flex  ${className}`}
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
}

export default VariantsList;
