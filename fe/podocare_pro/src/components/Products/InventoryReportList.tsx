import React from "react";
import { useState, useCallback } from "react";
import ActionButton from "../ActionButton";
import EditOrderPopup from "../Popups/EditOrderPopup";
import RemovePopup from "../Popups/RemovePopup";
import { INVENTORY_REPORTS_ITEM_LIST_ATTRIBUTES, ListAttribute } from "../../constants/list-headers";
import { Order } from "../../models/order";
import { Action } from "../../models/action";
import { calculateOrderItems } from "../../utils/orderUtils";
import { formatDate } from "../../utils/dateUtils";
import { InventoryReport } from "../../models/inventory_report";
import InventoryReportContent from "./InventoryReportContent";
import { useUser } from "../User/UserProvider";
import { RoleType } from "../../models/login";
import InventoryReportService from "../../services/InventoryReportService";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import StockAdjustmentReportPopup from "../Popups/StockAdjustmentReportPopup";

export interface InventoryReportListProps {
  attributes: ListAttribute[];
  inventoryReports: InventoryReport[];
  className?: string;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onSuccess?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

export function InventoryReportList({
  attributes,
  inventoryReports,
  className = "",
  onScroll,
  onSuccess,
  isLoading = false,
  hasMore = true,
}: InventoryReportListProps) {
  const { user } = useUser();
  const isAdmin = user?.roles.includes(RoleType.ROLE_ADMIN) ?? false;
  const [expandedInventoryReportIds, setExpandedInventoryReportIds] = useState<number[]>([]);
  const [editInventoryReportId, setEditInventoryReportId] =
    useState<number | null>(null);
  const [removeInventoryReportId, setRemoveInventoryReportId] =
    useState<number | null>(null);
  const [approveReportId, setApproveReportId] = useState<number | null>(null);
  const { showAlert } = useAlert();

  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, inventoryReport: InventoryReport) => {
      e.stopPropagation();
      setEditInventoryReportId(inventoryReport.id);
    },
    [setEditInventoryReportId]
  );

  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, inventoryReport: InventoryReport) => {
      e.stopPropagation();
      setRemoveInventoryReportId(inventoryReport.id);
    },
    [setRemoveInventoryReportId]
  );

  const toggleInventoryReports = (inventoryReportId: number) => {
    setExpandedInventoryReportIds((prevIds) =>
      prevIds.includes(inventoryReportId)
        ? prevIds.filter((id) => id !== inventoryReportId)
        : [...prevIds, inventoryReportId]
    );
  };

  const handleApproveReport = useCallback(async (id: number) => {
    InventoryReportService.approveReport(id)
      .then((data) => {
        showAlert("Pomyślnie zatweirdzono Raport!", AlertType.SUCCESS);
        setApproveReportId(null);
        onSuccess?.();
      })
      .catch((error) => {
        showAlert("Błąd podczas zatwierdzania Raportu!", AlertType.ERROR);
        console.error("Error while approving Inventory Report: ", error);
      })
  }, [])
  const deleteInventoryReport = useCallback(async(id: number) => {
    if(!removeInventoryReportId) return;

    InventoryReportService.deleteInventoryReport(removeInventoryReportId)
      .then(() => {
        showAlert("Pomyślnie usunięto Raport! Przywrócono ilość Produktów sprzed Raportu.", AlertType.SUCCESS);
        setRemoveInventoryReportId(null);
        onSuccess?.();
      })
      .catch((error: any) => {
        const message = error?.response?.status === 409 && error?.response?.data
          ? error.response.data
          : "Błąd podczas usuwania Raportu!";
        showAlert(message, AlertType.ERROR);
        console.error("Error while removing Inventory Report: ", error);
      })
  },[removeInventoryReportId])

  const renderAttributeContent = (
    attr: ListAttribute,
    inventoryReport: InventoryReport
  ): React.ReactNode => {
    switch (attr.name) {
      case "":
        return (
          <img
            src="src/assets/arrow_down.svg"
            alt="arrow down"
            className={`arrow-down ${
              expandedInventoryReportIds.includes(inventoryReport.id) ? "rotated" : ""
            }`}
          />
        );

      case "Użytkownik":
        return <span className="qv-span">{inventoryReport.createdBy.name}</span>;

      case "Data":
        return <span className="qv-span">{formatDate(inventoryReport.createdAt)}</span>;

      case "  ":
        return (
      <>
        {isAdmin && !inventoryReport.approved && (
          <div className="flex g-2 align-items-center">
            <span className="qv-span info">Sprawdź i zatwierdź Raport </span>
            <ActionButton
              text="Zatwierdź"
              src={"src/assets/tick.svg"}
              alt={"Zatwierdź"}
              onClick={(e) => {
                e.stopPropagation();
                setApproveReportId(inventoryReport.id);
              }}
              className="ir"
            />
          </div>
        )}
        {!isAdmin && !inventoryReport.approved && (
          <span className="qv-span awaits italic">Oczekuje na zatwierdzenie</span>
        )}
      </>
    );


    case "Zmiana" : {
        const totalPositive = inventoryReport.items.reduce((sum, item) => {
          const diff = item.supplyAfter - item.supplyBefore;
          return diff > 0 ? sum + diff : sum;
        }, 0);
        const totalNegative = inventoryReport.items.reduce((sum, item) => {
          const diff = item.supplyAfter - item.supplyBefore;
          return diff < 0 ? sum + diff : sum;
        }, 0);
        return (
          <span>
            {totalPositive >= 0 && <span className={`report-supply-change ml-1 ${totalPositive === 0 ? "neutral" : "positive"} list`}>+{totalPositive}</span>}
            {" / "}
            {totalNegative <= 0 && <span className={`report-supply-change  ${totalNegative === 0 ? "neutral" : "negative"} list`}>{totalNegative === 0 ? "-" + totalNegative : totalNegative}</span>}
            {totalPositive === 0 && totalNegative === 0 && "0"}
          </span>
        );
      }

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons flex ml-1">
            {!inventoryReport.approved && (
              <>
                <ActionButton
                  src={"src/assets/edit.svg"}
                  alt={"Edytuj Raport"}
                  iconTitle={"Edytuj Raport"}
                  text={"Edytuj"}
                  onClick={(e) => handleOnClickEdit(e, inventoryReport)}
                  disableText={true}
                />
                <ActionButton
                  src={"src/assets/cancel.svg"}
                  alt={"Usuń Raport"}
                  iconTitle={"Usuń Raport"}
                  text={"Usuń"}
                  onClick={(e) => handleOnClickRemove(e, inventoryReport)}
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
      className={`item-list order width-93 grid p-0 mt-05 ${inventoryReports.length === 0 ? "border-none" : ""} ${className}`}
      onScroll={onScroll}
      >
      {inventoryReports.map((inventoryReport) => (
        <div key={inventoryReport.id} className={`product-wrapper order ${className}`}>
          <div
            className={`item order align-items-center flex-column ${
              inventoryReport.items.length > 0 ? "pointer" : ""
            } ${className}`}
            onClick={() => toggleInventoryReports(inventoryReport.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inventoryReport.items.length > 0) {
                toggleInventoryReports(inventoryReport.id);
              }
            }}
          >
            <div className={`ir-item-header height-max width-max justify-center align-items-center flex ${expandedInventoryReportIds.includes(inventoryReport.id) ? "expanded" : ""}`}>
            {attributes.map((attr) => (
              <div
                key={`${inventoryReport.id}-${attr.name}`}
                className={`attribute-item flex ${
                  attr.name === "" ? "category-column" : ""
                } ${className}`}
                style={{
                  width: attr.width,
                  justifyContent: attr.justify,
                }}
              >
                {renderAttributeContent(attr, inventoryReport)}
              </div>
            ))}
            </div>
            {expandedInventoryReportIds.includes(inventoryReport.id) && (
            <InventoryReportContent
            attributes={INVENTORY_REPORTS_ITEM_LIST_ATTRIBUTES}
                inventoryReport={inventoryReport}
            />
          )}
          </div>
          
        </div>
      ))}
      {approveReportId != null && (
        <RemovePopup
          onClose={() => setApproveReportId(null)}
          warningText={"Zanim Zatwierdzisz sprawdź Raport!\n\nRaportu nie będzie można edytować/ usunąć!"}
          handleRemove={() => handleApproveReport(approveReportId)}
        />
      )}
      {editInventoryReportId != null && (
        <StockAdjustmentReportPopup
          onClose={() => setEditInventoryReportId(null)}
          onSuccess={onSuccess}
          inventoryReportId={editInventoryReportId}
        />
      )}
      {removeInventoryReportId != null && (
        <RemovePopup
          onClose={() => setRemoveInventoryReportId(null)}
          handleRemove={() => deleteInventoryReport(removeInventoryReportId)}
          warningText={"Ilość Produktów zostanie przywrócona do stanu sprzed Raportu."}
        />
      )}
      {isLoading &&  (
        <span className="qv-span text-align-center">Ładowanie...</span>
      )}
    </div>
  );
}

export default InventoryReportList;
