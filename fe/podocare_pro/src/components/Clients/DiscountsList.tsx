import React, { useCallback } from "react";
import ActionButton from "../ActionButton";
import { ListAttribute} from "../../constants/list-headers";
import { Discount } from "../../models/visit";

export interface DiscountsListProps {
  attributes: ListAttribute[];
  items: Discount[];
  setEditDiscountId?: (discountId: number | string | null) => void;
  setRemoveDiscountId?: (discountId: number | string | null) => void;
  className?: string;
  onClick?: (discount: Discount) => void;
}

export function DiscountsList({
  attributes,
  items,
  setEditDiscountId,
  setRemoveDiscountId,
  className = "",
  onClick,
}: DiscountsListProps) {

  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, item: Discount) => {
      e.stopPropagation();
      setEditDiscountId?.(item.id);
    },
    [setEditDiscountId]
  );

  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, item: Discount) => {
      e.stopPropagation();
      setRemoveDiscountId?.(item.id);
    },
    [setRemoveDiscountId]
  );


  const renderAttributeContent = (
    attr: ListAttribute,
    item: Discount,
    index: number,
  ): React.ReactNode => {
    switch (attr.name) {

        case "%":
        return `${item.percentageValue}%`

      case "Klienci":
        return `${item.clientCount}`;

        case "Nazwa":
        return `${item.name}`;

      case "Opcje":
        return (
<div className="item-list-single-item-action-buttons flex">
            <ActionButton
              src="src/assets/edit.svg"
              alt="Edytuj Rabat"
              iconTitle={"Edytuj Rabat"}
              text="Edytuj"
              onClick={(e) => handleOnClickEdit(e, item)}
              disableText={true}
            />
            <ActionButton
              src="src/assets/cancel.svg"
              alt="Usuń Rabat"
              iconTitle={"Usuń Rabat"}
              text="Usuń"
              onClick={(e) => handleOnClickRemove(e, item)}
              disableText={true}
            />
          </div>   
        );
    }
};
  return (
    <div
      className={`item-list width-93 grid p-0 mt-05 ${
        items.length === 0 ? "border-none" : ""
      } ${className} `}
      
    >
      {items.map((item, index) => (
        <div key={item.id} className={`product-wrapper ${className}`}>
          <div
            className={`item align-items-center flex ${className} `}
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
export default DiscountsList;
