import React, { useCallback } from "react";
import ActionButton from "../ActionButton";
import { ListAttribute} from "../../constants/list-headers";
import { Discount } from "../../models/visit";
import { CashLedger } from "../../models/cash_ledger";
import { formatDate } from "../../utils/dateUtils";

export interface CashLedgersListProps {
  attributes: ListAttribute[];
  items: CashLedger[];
  setSelectedCashLedger?: (cl: CashLedger) => void; 
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    isLoading?: boolean;
    hasMore?: boolean;
  className?: string;
  onClick?: (discount: Discount) => void;
}

export function CashLedgersList({
  attributes,
  items,
  setSelectedCashLedger,
  onScroll,
  isLoading = false,
  hasMore = true,
  className = "",
  onClick,
}: CashLedgersListProps) {

  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, item: CashLedger) => {
      e.stopPropagation();
      setSelectedCashLedger?.(item);
    },
    [setSelectedCashLedger]
  );


  const renderAttributeContent = (
    attr: ListAttribute,
    item: CashLedger,
    index: number,
  ): React.ReactNode => {
    switch (attr.name) {

        case "":
            return "";

        case "Data":
         return (
          <span className="order-values-lower-font-size ">
            {formatDate(item.date)}
          </span>
        );

      case "Otworzył":
        return (
          <span className="order-values-lower-font-size ">
            {item.createdBy?.name}
          </span>
        );

        case "Otwarcie":
        return (
          <span className="order-values-lower-font-size opening-amt">
            {(item.openingAmount + item.deposit).toFixed(2)} zł
          </span>
        );

        case "W tym depozyt":
        return (
          <span className={`order-values-lower-font-size ${item.deposit && item.deposit >0 ? "opening-amt" : ""}`}>
            {item.deposit.toFixed(2)} zł
          </span>
          
        );

        case "Zamknął":
        return (
          <span className="order-values-lower-font-size ">
            {item.closedBy?.name}
          </span>
        );

        case "Wypłacono":
        return (
          <span className={`order-values-lower-font-size ${item.cashOutAmount && item.cashOutAmount > 0 ? "cashout-amt" : ""}`}>
            {item.cashOutAmount.toFixed(2)} zł
          </span>
        );
        
        case "Saldo Końcowe":
        return (
          <span className="order-values-lower-font-size closing-amt">
            {item.closingAmount?.toFixed(2)}
          </span>
        );

        case "Notatka":
        return (
          <span className={`order-values-lower-font-size ${item.note ? "note pointer" : "no-note"}`}
          title={item.note ? `${item.note}` : "Brak notatki"}>
            {item.note ? "TAK" : "NIE"}
          </span>
        );

      case "Opcje":
        return (
<div className="item-list-single-item-action-buttons flex">
            <ActionButton
              src="src/assets/edit.svg"
              alt="Edytuj Kasetkę"
              iconTitle={"Edytuj Kasetkę"}
              text="Edytuj"
              onClick={(e) => handleOnClickEdit(e, item)}
              disableText={true}
            />
          </div>   
        );
    }
};
  return (
    <div
      className={`item-list width-93 flex-column p-0 mt-05 ${
        items.length === 0 ? "border-none" : ""
      } ${className} `}
      onScroll={onScroll}
    >
      {items.map((item, index) => (
        <div key={item.id} className={`product-wrapper width-max ${className}`}>
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
      {isLoading && (
        <span className="qv-span text-align-center">Ładowanie...</span>
      )}
    </div>
  );

}
export default CashLedgersList;
