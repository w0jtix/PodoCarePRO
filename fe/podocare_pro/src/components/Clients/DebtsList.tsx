import React, { useCallback, useState, useEffect } from "react";
import ActionButton from "../ActionButton";
import { ListAttribute } from "../../constants/list-headers";
import { ClientDebt, DebtType } from "../../models/debt";
import { PaymentStatus } from "../../models/payment";
import VisitPopup from "../Popups/VisitPopup";
import { DEBTS_BY_VISIT_LIST_ATTRIBUTES } from "../../constants/list-headers";

export interface DebtsListProps {
  attributes: ListAttribute[];
  items: ClientDebt[];
  setEditDebtId?: (debtId: number | string | null) => void;
  setRemoveDebtId?: (debtId: number | string | null) => void;
  className?: string;
  selectedDebts?: ClientDebt[];
  selectedIds?: number[];
  onSelect?: (debt: ClientDebt) => void;
}

export function DebtsList({
  attributes,
  items,
  setEditDebtId,
  setRemoveDebtId,
  className = "",
  selectedIds,
  onSelect,
}: DebtsListProps) {
  const [selectedClientDebtIdForVisit, setSelectedClientDebtIdForVisit] =useState<number | string | null>(null);
  const [selectedSourceVisitIdForVisit, setSelectedSourceVisitIdForVisit] =useState<number | string | null>(null);
  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, item: ClientDebt) => {
      e.stopPropagation();
      setEditDebtId?.(item.id);
    },
    [setEditDebtId]
  );

  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, item: ClientDebt) => {
      e.stopPropagation();
      setRemoveDebtId?.(item.id);
    },
    [setRemoveDebtId]
  );

  const renderAttributeContent = (
    attr: ListAttribute,
    item: ClientDebt,
    index: number
  ): React.ReactNode => {
    switch (attr.name) {
      case "":
        return " ";

      case "Status":
        return (
          <div
            onClick={(item.paymentStatus === PaymentStatus.PAID && attributes != DEBTS_BY_VISIT_LIST_ATTRIBUTES) ? () => setSelectedClientDebtIdForVisit(item.id) : undefined}
            className={`${(item.paymentStatus === PaymentStatus.PAID && attributes != DEBTS_BY_VISIT_LIST_ATTRIBUTES) ? 'pointer' : 'default'} flex align-items-center`}
          >
          <span
            className={`debt-list-span ${
              item.paymentStatus != PaymentStatus.PAID ? "unpaid" : attributes != DEBTS_BY_VISIT_LIST_ATTRIBUTES ? "paid available" : "paid"
            }`}
          >
            {item.paymentStatus != PaymentStatus.PAID
              ? "NIEOPŁACONE"
              : "OPŁACONE"}
          </span>
          </div>
        );

      case "Klient":
        return(
          <div className={`flex g-5px ${item.client.isDeleted ? "pointer" : ""}`} title={`${item.client.isDeleted ? "Klient usunięty" : ""}`}>
            
          <span className={`text-align-center ${item.client.isDeleted ? "client-removed" : ""}`}>{item.client.firstName + " " + item.client.lastName}</span>
          {item.client.isDeleted && <img src ="src/assets/removed.svg" alt="Client Removed" className="checkimg align-self-center"/>}
        </div>
      );

      case "Przyczyna":
        return (
          <span
            className={`debt-list-span ${
              item.type == DebtType.ABSENCE_FEE ? "absence" : "onhold"
            }`}
          >
            {item.type == DebtType.ABSENCE_FEE ? "NIEOBECNOŚĆ" : "ZALEGŁOŚĆ"}
          </span>
        );

      case "Źródło":
        return item.sourceVisit != null ? (
          <div className=""
            onClick={item.sourceVisit != null ? () => setSelectedSourceVisitIdForVisit(item.sourceVisit!.id) : undefined}
          >
            <span className="debt-list-span source pointer">Źródło długu</span>
          </div>
        ) : (
          <span className="debt-list-span">Brak źródła długu</span>
        );

      case "Wartość":
        return `${item.value} zł`;

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons flex">
            {item.sourceVisit === null && (
              <>
                <ActionButton
                  src="src/assets/edit.svg"
                  alt="Edytuj Dług"
                  iconTitle={"Edytuj Dług"}
                  text="Edytuj"
                  onClick={(e) => handleOnClickEdit(e, item)}
                  disableText={true}
                />
                <ActionButton
                  src="src/assets/cancel.svg"
                  alt="Usuń Dług"
                  iconTitle={"Usuń Dług"}
                  text="Usuń"
                  onClick={(e) => handleOnClickRemove(e, item)}
                  disableText={true}
                />
              </>
            )}
          </div>
        );
      default:
        return <span>{"-"}</span>;
    }
  };

  return (
    <div
      className={`item-list width-93 grid p-0 ${
        items.length === 0 ? "border-none" : ""
      } ${className}`}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`product-wrapper ${className} ${
            selectedIds?.includes(item.id) ? "selected" : ""
          }`}
        >
          <div
            className={`item align-items-center flex ${className} ${
              selectedIds?.includes(item.id) ? "selected" : ""
            }`}
            onClick={() => onSelect?.(item)}
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
      {(selectedClientDebtIdForVisit !== null) && (
        <VisitPopup
          onClose={() => setSelectedClientDebtIdForVisit(null)}
          debtRedemptionSourceId={selectedClientDebtIdForVisit}
        />
      )}
      {(selectedSourceVisitIdForVisit !== null) && (
        <VisitPopup
          onClose={() => setSelectedSourceVisitIdForVisit(null)}
          selectedSourceVisitIdForVisit={selectedSourceVisitIdForVisit}
        />
      )}
    </div>
  );
}

export default DebtsList;
