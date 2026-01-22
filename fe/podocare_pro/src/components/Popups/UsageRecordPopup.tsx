import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import { useCallback, useState } from "react";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import { NewUsageRecord, UsageRecordItem } from "../../models/usage-record";
import UsageRecordForm from "../Products/UsageRecordForm";
import { Employee } from "../../models/employee";
import UsageRecordService from "../../services/UsageRecordService";
import { validateUsageRecordsForm } from "../../utils/validators";

export interface UsageRecordPopupProps {
  onClose: () => void;
  className?: string;
}

export function UsageRecordPopup({
  onClose,
  className = "",
}: UsageRecordPopupProps) {
  const [usageRecordItems, setUsageRecordItems] = useState<UsageRecordItem[]>(
    []
  );
  const [sharedFields, setSharedFields] = useState({
    employee: null as Employee | null,
    usageDate: new Date().toISOString().split("T")[0],
  });
  const [hasSupplyError, setHasSupplyError] = useState(false);
  const { showAlert } = useAlert();

  const handleCreateUsageRecord = useCallback(async () => {
    const validationError = validateUsageRecordsForm(usageRecordItems, sharedFields, hasSupplyError);
    if (validationError) {
      showAlert(validationError, AlertType.ERROR);
      return;
    }

    const usageRecords: NewUsageRecord[] = usageRecordItems.map((item) => ({
      product: item.product,
      employee: sharedFields.employee,
      usageDate: sharedFields.usageDate,
      quantity: item.quantity,
      usageReason: item.usageReason,
    }));

    try {
      await UsageRecordService.createUsageRecords(usageRecords);
      showAlert(
        `Utworzono ${usageRecords.length} rekordów zużycia`,
        AlertType.SUCCESS
      );
      onClose();
    } catch (error) {
      console.error("Error creating usage records:", error);
      showAlert("Błąd podczas tworzenia rekordów zużycia", AlertType.ERROR);
    }
  }, [usageRecordItems, sharedFields, hasSupplyError, showAlert, onClose]);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay flex justify-center align-items-start short-version category ${className}`}
      onClick={onClose}
    >
      <div
        className="usage-record-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2 category">
          <h2 className="popup-title">Nowe Zużycie Produktu</h2>
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
        <section className="create-usage-popup width-max flex justify-center">
          <UsageRecordForm
            usageRecordItems={usageRecordItems}
            setUsageRecordItems={setUsageRecordItems}
            sharedFields={sharedFields}
            setSharedFields={setSharedFields}
            hasSupplyError={hasSupplyError}
            setHasSupplyError={setHasSupplyError}
          />
        </section>
        <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={handleCreateUsageRecord}
          className="f-1"
        />
      </div>
    </div>,
    portalRoot
  );
}

export default UsageRecordPopup;
