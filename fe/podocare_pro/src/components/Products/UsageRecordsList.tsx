import { UsageReason, UsageRecord, getUsageReasonDisplay } from "../../models/usage-record";
import { ListAttribute } from "../../constants/list-headers";
import ActionButton from "../ActionButton";
import { useCallback } from "react";
import { formatDate } from "../../utils/dateUtils";

export interface UsageRecordsListProps {
  attributes: ListAttribute[];
  items: UsageRecord[];
  setRemoveUsageRecordId?: (usageRecordId: number | null) => void;
  setIsAddNewUsageRecordPopupOpen?: (isOpen: boolean) => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  className?: string;
}

export function UsageRecordsList({
  attributes,
  items,
  setRemoveUsageRecordId,
  onScroll,
  isLoading = false,
  hasMore = true,
  className = "",
}: UsageRecordsListProps) {
  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, item: UsageRecord) => {
      e.stopPropagation();
      setRemoveUsageRecordId?.(item.id);
    },
    [setRemoveUsageRecordId]
  );

  const renderAttributeContent = (
    attr: ListAttribute,
    item: UsageRecord,
    index: number
  ): React.ReactNode => {
    switch (attr.name) {
      case "":
        return (
          <div
            className="category-container width-40 p-0 ml-1"
            style={{
              backgroundColor: item.product.category?.color
                ? `rgb(${item.product.category.color})`
                : undefined,
            }}
          />
        );

      case "Produkt":
        return <span className="product-span usage ml-1">{item.product.name}</span>;

      case "Pracownik":
        return (
          <div className="flex g-1">
            <span className="list-span usage">{item.employee.name}</span>
          </div>
        );

      case "Ilość":
        return <span className="list-span usage">{item.quantity}</span>;
      case "Data":
        return <span className="list-span usage">{formatDate(item.usageDate)}</span>;

      case "Powód":
        return <span className={`product-span usage ${item.usageReason === UsageReason.REGULAR_USAGE ? "active-y" : item.usageReason === UsageReason.OUT_OF_DATE ? "active-r" : ""}`}>{getUsageReasonDisplay(item.usageReason)}</span>;

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons flex ml-1">
            <ActionButton
              src="src/assets/cancel.svg"
              alt="Usuń Zużycie Produktut"
              iconTitle={"Usuń Zużycie Produktu"}
              text="Usuń"
              onClick={(e) => handleOnClickRemove(e, item)}
              disableText={true}
            />
          </div>
        );
      default:
        return <span>{"-"}</span>;
    }
  };
  return (
    <div
      className={`item-list width-max grid p-0 mb-2 ${
        items.length === 0 ? "border-none" : ""
      } ${className}`}
      onScroll={onScroll}
    >
      {items.map((item, index) => (
        <div key={item.id} className={`product-wrapper ${className} `}>
          <div className={`item flex ${className} `}>
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
      {isLoading && (
        <span className="qv-span text-align-center">Ładowanie...</span>
      )}
    </div>
  );
}
export default UsageRecordsList;
