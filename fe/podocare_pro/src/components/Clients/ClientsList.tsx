import React, { useCallback, useEffect } from "react";
import ActionButton from "../ActionButton";
import { useState } from "react";
import { ListAttribute} from "../../constants/list-headers";
import { BaseService } from "../../models/service";
import { Client } from "../../models/client";
import { Action } from "../../models/action";
import VisitService from "../../services/VisitService";

export interface ClientsListProps {
  attributes: ListAttribute[];
  items: Client[];
  setIsEditClientPopupOpen?: (isOpen: boolean) => void;
  setIsRemoveClientPopupOpen?: (isOpen: boolean) => void;
  setSelectedClient?: (client: Client | null) => void;
  className?: string;
  onClick?: (client: Client) => void;
  action?: Action,
  selectedClients?: Client[];
}

export function ClientsList({
  attributes,
  items,
  setIsEditClientPopupOpen,
  setIsRemoveClientPopupOpen,
  setSelectedClient,
  className = "",
  onClick,
  action,
  selectedClients,
}: ClientsListProps) {
  const [visitCounts, setVisitCounts] = useState<Map<string | number, number>>(new Map());

  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, item: Client) => {
      e.stopPropagation();
      setSelectedClient?.(item);
      setIsEditClientPopupOpen?.(true);
    },
    [setSelectedClient, setIsEditClientPopupOpen]
  );

  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, item: Client) => {
      e.stopPropagation();
      setSelectedClient?.(item);
      setIsRemoveClientPopupOpen?.(true);
    },
    [setSelectedClient, setIsRemoveClientPopupOpen]
  );

  const renderAttributeContent = (
    attr: ListAttribute,
    item: Client,
    index: number,
  ): React.ReactNode => {
    switch (attr.name) {

        case " ":
          return "";

        case "Zniżka": 
        return `${item.discount?.name ?? "-"}`

        case "#":
        return index + 1;

      case "":
        return (
          <div
          className="flex g-10px align-items-center"
          >
          {item.boostClient && (
            <img
              src="src/assets/boost.svg"
              alt="Boost"
              title="Klient z Boosta"
              className="client-form-icon"
            />
          )}
          {!item.signedRegulations && (
            <img
              src="src/assets/warning.svg"
              alt="Terms not Signed"
              title="Klient nie podpisał Regulaminu"
              className="client-form-icon"
            />
          )} 
          {item.discount && (
            <img
              src="src/assets/client_discount.svg"
              alt="ClientDiscount"
              title="Klient ma przypisaną stałą Zniżkę"
              className="client-form-icon"
            />
          )} 
          {item.hasDebts && (
            <img
              src="src/assets/debt.svg"
              alt="ClientDebt"
              title="Klient posiada Dług"
              className="client-form-icon"
            />
          )} 
          
          {item.hasGoogleReview && (
            <img
              src="src/assets/google.png"
              alt="Google Review"
              title="Klient zostawił opinię Google"
              className="client-form-icon google"
            />
          )} 
          {item.hasActiveGoogleReview && (
            <img
              src="src/assets/active_google_review.svg"
              alt="Active Google Review"
              title="Klientowi przysługuje rabat za opinię Google"
              className="client-form-icon"
            />
          )} 
          {item.hasBooksyReview && (
            <img
              src="src/assets/booksy.png"
              alt="Booksy Review"
              title="Klient zostawił opinię Booksy"
              className="client-form-icon booksy"
            />
          )}
          {item.hasActiveVoucher && (
            <img
              src="src/assets/voucher.svg"
              alt="Active Voucher"
              title="Klient posiada aktywny Voucher"
              className="client-form-icon"
            />
          )} 
          
          </div>
        );

      case "Klient":
        return `${item.firstName + " " + item.lastName}`;

      case "Wizyty":
        return `${item.visitsCount}`;

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons flex">
            <ActionButton
              src="src/assets/edit.svg"
              alt="Edytuj Klienta"
              iconTitle={"Edytuj Klienta"}
              text="Edytuj"
              onClick={(e) => handleOnClickEdit(e, item)}
              disableText={true}
            />
            <ActionButton
              src="src/assets/cancel.svg"
              alt="Usuń Klienta"
              iconTitle={"Usuń Klienta"}
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
      className={`item-list width-93 grid p-0 mt-05 ${
        items.length === 0 ? "border-none" : ""
      } ${className} `}
      
    >
      {items.map((item, index) => (
        <div key={item.id} className={`product-wrapper ${className} ${
                selectedClients?.some((c) => c.id === item.id) ? "selected" : ""
              }` } onClick={() => onClick?.(item)}>
          <div
            className={`item align-items-center pointer flex ${className} ${(item.boostClient && action != Action.SELECT)? "boost" : ""} ${
                selectedClients?.some((c) => c.id === item.id) ? "selected" : ""
              }`}
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

export default ClientsList;
