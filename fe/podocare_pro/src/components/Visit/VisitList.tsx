import React from "react";
import arrowDownIcon from "../../assets/arrow_down.svg";
import boostIcon from "../../assets/boost.svg";
import vipIcon from "../../assets/vip.svg";
import timeIcon from "../../assets/time.svg";
import absenceIcon from "../../assets/absence.svg";
import debtRedemptionIcon from "../../assets/debt_redemption.svg";
import clientDiscountIcon from "../../assets/client_discount.svg";
import saleIcon from "../../assets/sale.svg";
import previewIcon from "../../assets/preview.svg";
import cancelIcon from "../../assets/cancel.svg";
import { useState, useCallback } from "react";
import ActionButton from "../ActionButton";
import { ListAttribute } from "../../constants/list-headers";
import { formatDate, getWeekday } from "../../utils/dateUtils";
import { Visit } from "../../models/visit";
import { translatePaymentStatus } from "../../utils/paymentUtils";
import VisitContent from "./VisitContent";
import RemoveVisitPopup from "../Popups/RemoveVisitPopup";
import VisitPopup from "../Popups/VisitPopup";
import { useUser } from "../User/UserProvider";
import { RoleType } from "../../models/login";

export interface VisitListProps {
  attributes: ListAttribute[];
  visits: Visit[];
  className?: string;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  handleResetFiltersAndData?: () => void;
  disableExpand?: boolean;
}

export function VisitList({
  attributes,
  visits,
  className = "",
  onScroll,
  isLoading = false,
  handleResetFiltersAndData,
  disableExpand = false,
}: VisitListProps) {
  const [expandedVisitIds, setExpandedVisitIds] = useState<number[]>([]);
  const [previewVisitId, setPreviewVisitId] =
    useState<string | number | null>(null);
  const [removeVisitId, setRemoveVisitId] =
    useState<number | string | null>(null);
  const { user } = useUser();

  const handleOnClickPreview = useCallback(
    (e: React.MouseEvent, visit: Visit) => {
      e.stopPropagation();
      setPreviewVisitId(visit.id);
    },
    [setPreviewVisitId]
  );
  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, visit: Visit) => {
      e.stopPropagation();
      setRemoveVisitId(visit.id);
    },
    [setRemoveVisitId]
  );

  const toggleVisits = (visitId: number) => {
    setExpandedVisitIds((prevIds) =>
      prevIds.includes(visitId)
        ? prevIds.filter((id) => id !== visitId)
        : [...prevIds, visitId]
    );
  };

  const renderAttributeContent = (
    attr: ListAttribute,
    visit: Visit
  ): React.ReactNode => {
    switch (attr.name) {
      case "":
        return (
          <img
            src={arrowDownIcon}
            alt="arrow down"
            className={`arrow-down ${
              expandedVisitIds.includes(visit.id) ? "rotated" : ""
            }`}
          />
        );

      case "Data":
        return (
          <span className="order-values-lower-font-size">
            {formatDate(visit.date)}
          </span>
        );

      case "Pracownik":
        return (
          <span className="order-values-lower-font-size">
            {visit.employee.name}
          </span>
        );

      case "Klient":
        return (
          <span className="order-values-lower-font-size">
            {visit.client.firstName + " " + visit.client.lastName}
          </span>
        );

      case " ":
        return (
          <div className="flex g-10px align-items-center">
            {visit.isBoost && (
              <img
                src={boostIcon}
                alt="Boost Visit"
                title="Wizyta objęta Boost"
                className="visit-form-icon"
              />
            )}
            {visit.isVip && (
              <img
                src={vipIcon}
                alt="Vip Visit"
                title="Wizyta VIP"
                className="visit-form-icon"
              />
            )}
            {visit.delayTime != null && (
              <img
                src={timeIcon}
                alt="Delayed"
                title="Klient spóźnił się na Wizytę"
                className="visit-form-icon"
              />
            )}
            {visit.absence && (
              <img
                src={absenceIcon}
                alt="Absence"
                title="Nieobecność"
                className="visit-form-icon"
              />
            )}
            {visit.debtRedemptions.length > 0 && (
              <img
                src={debtRedemptionIcon}
                alt="Visit with Radeemed Debts"
                title="Klient spłacił zadłużenie"
                className="visit-form-icon"
              />
            )}
            {visit.serviceDiscounts.length > 0 && (
              <img
                src={clientDiscountIcon}
                alt="Visit Discounted"
                title="Wizyta objęta Rabatem"
                className="visit-form-icon"
              />
            )}
            {visit.sale != null && (
              <img
                src={saleIcon}
                alt="Visit with Sale"
                title="Klient zakupił Produkty lub Voucher"
                className="visit-form-icon"
              />
            )}
          </div>
        );

      case "Wartość":
        return (
          <span className="order-values-lower-font-size ml-1">
            {visit.totalValue}zł
          </span>
        );

      case "Status":
        return (
          <span
            className={`order-values-lower-font-size ${visit.paymentStatus.toLocaleLowerCase()} ml-1`}
          >
            {translatePaymentStatus(visit.paymentStatus)}
          </span>
        );

      case "Opcje":
        return (
          
            <div className="item-list-single-item-action-buttons flex ml-1">
            <ActionButton
              src={previewIcon}
              alt={"Podgląd Wizyty"}
              iconTitle={"Podgląd Wizyty"}
              text={"Podgląd"}
              onClick={(e) => handleOnClickPreview(e, visit)}
              disableText={true}
            />
            {(visit.createdBy === user?.id || user?.roles.includes(RoleType.ROLE_ADMIN)) && (
            <ActionButton
              src={cancelIcon}
              alt={"Usuń Wizytę"}
              iconTitle={"Usuń Wizytę"}
              text={"Usuń"}
              onClick={(e) => handleOnClickRemove(e, visit)}
              disableText={true}
            />
            )}
          </div>
          
        );

        case "Podgląd":
        return (
          <div className="item-list-single-item-action-buttons flex">
            <ActionButton
              src={previewIcon}
              alt={"Podgląd Wizyty"}
              iconTitle={"Podgląd Wizyty"}
              text={"Podgląd"}
              onClick={(e) => handleOnClickPreview(e, visit)}
              disableText={true}
            />
          </div>
        );

        case "Wpływ":
        return (
          <span className="order-values-lower-font-size income">
            + {visit.payments
              .filter((p) => p.method === "CASH")
              .reduce((sum, p) => sum + p.amount, 0)
              .toFixed(2)} zł
          </span>
        );

      default:
        return <span>{"-"}</span>;
    }
  };

  return (
    <div
      className={`item-list flex-column order width-max p-0 mt-05 ${
        visits.length === 0 ? "border-none" : ""
      } ${className}`}
      onScroll={onScroll}
    >
      {visits.map((visit, index) => {
        const showDateSeparator =
          index === 0 || visits[index - 1].date !== visit.date;
        return (
          <div className="width-max align-items-center" key={visit.id}>
            {showDateSeparator && !disableExpand && (
              <div className="day-separator width-fit-content mb-05">
                {
                  <span className="qv-span f12">
                    {formatDate(visit.date) + " - " + getWeekday(visit.date)}
                  </span>
                }
              </div>
            )}
            <div
              key={visit.id}
              className={`product-wrapper order ${className}`}
            >
              <div
                className={`item order align-items-center flex-column ${disableExpand ? "" : "pointer"} ${className}`}
                onClick={disableExpand ? undefined : () => toggleVisits(visit.id)}
                onKeyDown={disableExpand ? undefined : (e) => {
                  if (e.key === "Enter") {
                    toggleVisits(visit.id);
                  }
                }}
              >
                <div
                  className={`visit-list-header height-max width-max justify-center align-items-center flex ${
                    expandedVisitIds.includes(visit.id) ? "expanded" : ""
                  }`}
                >
                  {attributes.map((attr) => (
                    <div
                      key={`${visit.id}-${attr.name}`}
                      className={`attribute-item flex ${
                        attr.name === "" ? "category-column" : ""
                      } ${className}`}
                      style={{
                        width: attr.width,
                        justifyContent: attr.justify,
                      }}
                    >
                      {renderAttributeContent(attr, visit)}
                    </div>
                  ))}
                </div>
                {!disableExpand && expandedVisitIds.includes(visit.id) && (
                  <VisitContent visit={visit} />
                )}
              </div>
            </div>
          </div>
        );
      })}
      {previewVisitId != null && (
        <VisitPopup
          onClose={() => setPreviewVisitId(null)}
          visitId={previewVisitId}
        />
      )}
      {removeVisitId != null && (
        <RemoveVisitPopup
          onClose={() => setRemoveVisitId(null)}
          handleResetFiltersAndData={handleResetFiltersAndData!}
          visitId={removeVisitId}
        />
      )}
      {isLoading && (
        <span className="qv-span text-align-center">Ładowanie...</span>
      )}
    </div>
  );
}

export default VisitList;
