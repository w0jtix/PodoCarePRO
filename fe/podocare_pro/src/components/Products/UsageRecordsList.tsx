import { UsageReason, UsageRecord, getUsageReasonDisplay } from "../../models/usage-record";
import cancelIcon from "../../assets/cancel.svg";
import { ListAttribute } from "../../constants/list-headers";
import ActionButton from "../ActionButton";
import { useCallback } from "react";
import { formatDate } from "../../utils/dateUtils";
import { useUser } from "../User/UserProvider";
import { RoleType } from "../../models/login";

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
  className = "",
}: UsageRecordsListProps) {
  const { user } = useUser();
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
          <div className="item-list-single-item-action-buttons flex">
            {(item.createdBy === user?.id || user?.roles.includes(RoleType.ROLE_ADMIN)) && (
            <ActionButton
              src={cancelIcon}
              alt="Usuń Zużycie Produktut"
              iconTitle={"Usuń Zużycie Produktu"}
              text="Usuń"
              onClick={(e) => handleOnClickRemove(e, item)}
              disableText={true}
            />
            )}
          </div>
        );
      default:
        return <span>{"-"}</span>;
    }
  };
  return (
    <div
      className={`item-list width-max flex-column p-0 mb-2 ${
        items.length === 0 ? "border-none" : ""
      } ${className}`}
      onScroll={onScroll}
    >
      {items.map((item) => (
        <div key={item.id} className={`product-wrapper width-max ${className} min-height-req-25`}>
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
                {renderAttributeContent(attr, item)}
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
