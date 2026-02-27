import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import { useCallback, useState, useEffect } from "react";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import { validateInventoryReportForm } from "../../utils/validators";
import InventoryReportForm from "../Products/InventoryReportForm";
import { InventoryReportItem, NewInventoryReport, NewInventoryReportItem } from "../../models/inventory_report";
import InventoryReportService from "../../services/InventoryReportService";
import AuthService from "../../services/AuthService";
import { RoleType } from "../../models/login";
import { Action } from "../../models/action";

export interface StockAdjustmentReportPopupProps {
  onClose: () => void;
  onSuccess?: () => void;
  inventoryReportId?: number;
  className?: string;
}

export function StockAdjustmentReportPopup({
  onClose,
  onSuccess,
  inventoryReportId,
  className = "",
}: StockAdjustmentReportPopupProps) {
  const [inventoryReportItems, setInventoryReportItems] = useState<InventoryReportItem[] | NewInventoryReportItem[]>(
    []
  );
  const [fetchedItems, setFetchedItems] = useState<InventoryReportItem[] | null>(null);
  const [hasUnapproved, setHasUnapproved] = useState(false);
  const { showAlert } = useAlert();

  const action = inventoryReportId ? Action.EDIT : Action.CREATE;

  const checkApprovalStatus = useCallback(() => {
    InventoryReportService.areAllApproved()
      .then((allApproved) =>
        setHasUnapproved(!allApproved)
    )
      .catch((error) => {
        showAlert("Błąd!", AlertType.ERROR);
        console.error("Error checking approval status:", error)
  });
  }, []);

  const fetchInventoryReport = useCallback((id: number) => {
    InventoryReportService.getInventoryReportById(id)
      .then((data) => {
        setInventoryReportItems(data.items);
        setFetchedItems(data.items);
      })
      .catch((error) => {
        console.error("Error fetching Inventory Report!", error);
        showAlert("Błąd podczas pobierania Raportu!", AlertType.ERROR);
      });
  }, [showAlert]);

  useEffect(() => {
    if (action === Action.CREATE) {
      checkApprovalStatus();
    }
  }, [action, checkApprovalStatus]);

  useEffect(() => {
    if (inventoryReportId) {
      fetchInventoryReport(inventoryReportId);
    }
  }, [inventoryReportId, fetchInventoryReport]);

  const handleInventoryReportAction = useCallback(async () => {
    const validationError = validateInventoryReportForm(inventoryReportItems, action, fetchedItems);
    if(validationError) {
      showAlert(validationError, AlertType.ERROR);
      return;
    }
    const inventoryReport: NewInventoryReport = {
      items: inventoryReportItems as NewInventoryReportItem[],
    }

    try {
      if (action === Action.CREATE) {
        await InventoryReportService.createInventoryReport(inventoryReport);
        showAlert(
          `Utworzono Raport Stanu Magazynowego!`,
          AlertType.SUCCESS
        );
      } else {
        await InventoryReportService.updateInventoryReport(inventoryReportId!, inventoryReport);
        showAlert(
          `Zaktualizowano Raport Stanu Magazynowego!`,
          AlertType.SUCCESS
        );
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error(`Error ${action === Action.CREATE ? "creating" : "updating"} Inventory Report:`, error);
      const message = error?.response?.status === 409 && error?.response?.data
        ? error.response.data
        : `Błąd podczas ${action === Action.CREATE ? "tworzenia" : "aktualizacji"} Raportu Stanu Magazynowego!`;
      showAlert(message, AlertType.ERROR);
    }
  },[inventoryReportItems, action, inventoryReportId, showAlert, onSuccess, onClose])


  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay flex justify-center align-items-start short-version category ${className}`}
    >
      <div
        className="stock-adjustment-report-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2 category">
          <h2 className="popup-title">
            {action === Action.CREATE
              ? "Raport Spisu Magazynowego"
              : "Edytuj Raport Spisu Magazynowego"}
          </h2>
          <button
            className="popup-close-button  transparent border-none flex align-items-center justify-center absolute pointer"
            onClick={onClose}
          >
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        {hasUnapproved && action === Action.CREATE ? (
          <div className="unapproved-warning flex-column align-items-center justify-center f-1 g-2">
            <span className="qv-span warning ir">Wymagana Akcja:</span>
            <span className="qv-span ir">
              {AuthService.getCurrentUser()?.roles.includes(RoleType.ROLE_ADMIN)
                ? "W bazie danych są niezatwierdzone Raporty. By utworzyć kolejny Raport zatwierdź poprzednie!"
                : "W bazie danych są niezatwierdzone Raporty. Skontaktuj się z administratorem w celu ich zatwierdzenia."}
            </span>
          </div>
        ) : (
          <>
            <section className="create-usage-popup width-max flex justify-center">
              <InventoryReportForm
                inventoryReportItems={inventoryReportItems}
                setInventoryReportItems={setInventoryReportItems}
                className={""}
              />
            </section>
            <ActionButton
              src={"src/assets/tick.svg"}
              alt={"Zapisz"}
              text={"Zapisz"}
              onClick={handleInventoryReportAction}
              className="f-1 bottom-push"
            />
          </>
        )}
      </div>
    </div>,
    portalRoot
  );
}

export default StockAdjustmentReportPopup;
