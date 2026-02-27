import React from "react";
import { useState, useCallback, useMemo, useEffect } from "react";
import ActionButton from "../ActionButton";
import { ListAttribute } from "../../constants/list-headers";
import { formatDate, getWeekday, getWeeksOfMonth, WeekRange } from "../../utils/dateUtils";
import VisitPopup from "../Popups/VisitPopup";
import { BonusVisit } from "../../models/employee";

export interface BonusHistoryVisitListProps {
  attributes: ListAttribute[];
  visits: BonusVisit[];
  month: number;
  year: number;
  className?: string;
}

function isInWeek(visitDate: string, week: WeekRange): boolean {
  const d = new Date(visitDate);
  d.setHours(0, 0, 0, 0);
  const start = new Date(week.start);
  start.setHours(0, 0, 0, 0);
  const end = new Date(week.end);
  end.setHours(23, 59, 59, 999);
  return d >= start && d <= end;
}

export function BonusHistoryVisitList({
  attributes,
  visits,
  month,
  year,
  className = "",
}: BonusHistoryVisitListProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);

  const weeks = useMemo(() => getWeeksOfMonth(year, month), [year, month]);

  const [previewVisitId, setPreviewVisitId] =
    useState<string | number | null>(null);

  const toggleWeek = useCallback((weekNumber: number) => {
    setExpandedWeeks((prev) =>
      prev.includes(weekNumber)
        ? prev.filter((w) => w !== weekNumber)
        : [...prev, weekNumber]
    );
  }, []);

  const handleOnClickPreview = useCallback(
    (e: React.MouseEvent, visit: BonusVisit) => {
      e.stopPropagation();
      setPreviewVisitId(visit.visitId);
    },
    [setPreviewVisitId]
  );

  useEffect(()=> {
    setExpandedWeeks([]);
  }, [visits])

  const weekVisitsMap = useMemo(() => {
    const map = new Map<number, BonusVisit[]>();
    for (const week of weeks) {
      const weekVisits = visits.filter((v) => isInWeek(v.date, week));
      map.set(week.weekNumber, weekVisits);
    }
    return map;
  }, [weeks, visits]);


  const renderAttributeContent = (
    attr: ListAttribute,
    visit: BonusVisit
  ): React.ReactNode => {
    switch (attr.name) {

     case "":
        return "";

      case "Klient":
        return (
          <span className="order-values-lower-font-size" style={{ maxWidth: 150, overflow: "hidden", whiteSpace: "nowrap" }}>
            {visit.clientName}
          </span>
        );

      case "Płatność":
        return (
          <span title="Suma płatności." className="order-values-lower-font-size pointer add">
            +{visit.paymentsSum}
          </span>
        );

      case "Płatność Voucherem":
        return (
          <span title="Suma płatności Voucherem. Voucher rozliczany jest w momencie sprzedaży, a nie realizacji." className="order-values-lower-font-size pointer subtract">
            -{visit.voucherPaymentsSum}
          </span>
        );

        case "Produkty":
        return (
          <span title="Suma wartości sprzedanych Produktów. Premia Produktowa liczona jest osobno." className="order-values-lower-font-size pointer subtract">
            -{visit.productsValue}
          </span>
        );

      case "Wartość":
        return (
          <span className="order-values-lower-font-size ml-1">
            {visit.adjustedRevenue}zł
          </span>
        );

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons flex">
            <ActionButton
              src={"src/assets/preview.svg"}
              alt={"Podgląd Wizyty"}
              iconTitle={"Podgląd Wizyty"}
              text={"Podgląd"}
              onClick={(e) => handleOnClickPreview(e, visit)}
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
        visits.length === 0 ? "border-none" : ""
      } ${className}`}
    >
      {weeks.map((week) => {
        const weekVisits = weekVisitsMap.get(week.weekNumber) ?? [];
        const weekSum = weekVisits.reduce((sum, v) => sum + v.adjustedRevenue, 0);

        const startStr = formatDate(week.start.toISOString());
        const endStr = formatDate(week.end.toISOString());

        return (
          <div key={`week-${week.weekNumber}`} className="flex-column width-95 align-items-center justify-self-center">
            <div
              className="week-separator flex width-max space-between align-items-center pointer"
              onClick={() => toggleWeek(week.weekNumber)}
            >
                <div className="flex g-10px align-items-center" style={{ flex: 1 }}>
                <img
            src="src/assets/arrow_down.svg"
            alt="arrow down"
            className={`arrow-down ${
              expandedWeeks.includes(week.weekNumber) ? "rotated" : ""
            }`}
            />
              <span className="qv-span f12">
                {"Tydzień " + week.weekNumber+"."}
              </span>
              </div>
              <span className="qv-span f12" style={{ textAlign: "center" }}>
                {startStr + "-" + endStr}
              </span>
              <span title="Suma wpływów z tego tygodnia." className={`qv-span f12 profit ${weekSum > 0 ? "w" : ""}`} style={{ flex: 1, textAlign: "right" }}>
                + {weekSum}zł
              </span>
            </div>

            {expandedWeeks.includes(week.weekNumber) && weekVisits.length === 0 && (
              <div className="sb-nv width-max flex justify-center align-items-center">
                <span className="qv-span f12 italic">Brak wizyt w tym tygodniu.</span>
              </div>
            )}

            {expandedWeeks.includes(week.weekNumber) && weekVisits.map((visit, index) => {
              const showDateSeparator =
                index === 0 || weekVisits[index - 1].date !== visit.date;
              const daySum = showDateSeparator
                ? weekVisits.filter((v) => v.date === visit.date).reduce((sum, v) => sum + v.adjustedRevenue, 0)
                : 0;

              return (
                <div key={visit.visitId} className="width-max">
                  {showDateSeparator && (
                    <div className="day-separator sb-rev flex width-95 justify-self-center space-between align-items-center">
                      <span className="qv-span f12">
                        {formatDate(visit.date) + " - " + getWeekday(visit.date)}
                      </span>
                      <span title="Suma wpływów z tego dnia." className="qv-span f12 profit-d">
                + {daySum}zł
              </span>
                    </div>
                  )}
                  <div
                    className={`product-wrapper ${className}`}
                  >
                    <div
                      className={`item align-items-center flex-column pointer ${className}`}
                    >
                      <div
                        className="visit-list-header height-max width-max justify-center align-items-center flex"
                      >
                        {attributes.map((attr) => (
                          <div
                            key={`${visit.visitId}-${attr.name}`}
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      {previewVisitId != null && (
        <VisitPopup
          onClose={() => setPreviewVisitId(null)}
          visitId={previewVisitId}
        />
      )}
    </div>
  );
}

export default BonusHistoryVisitList;
