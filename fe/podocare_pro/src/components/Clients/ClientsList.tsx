import React, { useCallback } from "react";
import ActionButton from "../ActionButton";
import { ListAttribute} from "../../constants/list-headers";
import { Client } from "../../models/client";
import { Action } from "../../models/action";
import { useUser } from "../User/UserProvider";
import { RoleType } from "../../models/login";
import redflagIcon from "../../assets/redflag.svg";
import boostIcon from "../../assets/boost.svg";
import warningIcon from "../../assets/warning.svg";
import clientDiscountIcon from "../../assets/client_discount.svg";
import debtIcon from "../../assets/debt.svg";
import activeGoogleReviewIcon from "../../assets/active_google_review.svg";
import voucherIcon from "../../assets/voucher.svg";
import editIcon from "../../assets/edit.svg";
import cancelIcon from "../../assets/cancel.svg";

export interface ClientsListProps {
  attributes: ListAttribute[];
  items: Client[];
  setRemoveClientId?: (clientId: number | null) => void;
  setSelectedClientId?: (clientId: number | null) => void;
  className?: string;
  onClick?: (client: Client) => void;
  action?: Action,
  selectedClients?: Client[];
}

export function ClientsList({
  attributes,
  items,
  setRemoveClientId,
  setSelectedClientId,
  className = "",
  onClick,
  action,
  selectedClients,
}: ClientsListProps) {
  const { user } = useUser();

  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, item: Client) => {
      e.stopPropagation();
      setSelectedClientId?.(item.id);
    },
    [setSelectedClientId]
  );

  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, item: Client) => {
      e.stopPropagation();
      setRemoveClientId?.(item.id);
    },
    [setRemoveClientId]
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
            {item.redFlag && (
            <img
              src={redflagIcon}
              alt="RedFlag"
              title="Klient RedFlag"
              className="client-form-icon"
            />
          )}
          {item.boostClient && (
            <img
              src={boostIcon}
              alt="Boost"
              title="Klient z Boosta"
              className="client-form-icon"
            />
          )}
          {!item.signedRegulations && (
            <img
              src={warningIcon}
              alt="Terms not Signed"
              title="Klient nie podpisał Regulaminu"
              className="client-form-icon"
            />
          )} 
          {item.discount && (
            <img
              src={clientDiscountIcon}
              alt="ClientDiscount"
              title="Klient ma przypisaną stałą Zniżkę"
              className="client-form-icon"
            />
          )} 
          {item.hasDebts && (
            <img
              src={debtIcon}
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
              src={activeGoogleReviewIcon}
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
              src={voucherIcon}
              alt="Active Voucher"
              title="Klient posiada aktywny Voucher"
              className="client-form-icon"
            />
          )} 
          
          </div>
        );

      case "Klient":
        return <span className="qv-span clients">{item.firstName + " " + item.lastName}</span>;

      case "Wizyty":
        return <span className="qv-span clients ml-1">{item.visitsCount}</span>;

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons flex ml-1">
            <ActionButton
              src={editIcon}
              alt="Edytuj Klienta"
              iconTitle={"Edytuj Klienta"}
              text="Edytuj"
              onClick={(e) => handleOnClickEdit(e, item)}
              disableText={true}
            />
            {(item.createdBy === user?.id || user?.roles.includes(RoleType.ROLE_ADMIN)) && (
              <ActionButton
              src={cancelIcon}
              alt="Usuń Klienta"
              iconTitle={"Usuń Klienta"}
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
      className={`item-list width-93 flex-column p-0 mt-05 ${
        items.length === 0 ? "border-none" : ""
      } ${className} `}
      
    >
      {items.map((item, index) => (
        <div key={item.id} className={`product-wrapper width-max ${className} ${
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
