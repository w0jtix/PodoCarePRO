import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import { CashLedger } from "../../models/cash_ledger";
import CashLedgerForm from "../CashLedger/CashLedgerForm";
import { Action } from "../../models/action";

export interface CashLedgerPopupProps {
  onClose: () => void;
  cashLedger?: CashLedger;
  setCashLedger?: React.Dispatch<
          React.SetStateAction<CashLedger | null>
        >;
  handleCloseCashLedger: () => void;
  className?: string;
  action?: Action;
}

export function CashLedgerPopup ({
  onClose,
  cashLedger,
  setCashLedger,
  handleCloseCashLedger,
  className = "",
  action = Action.DISPLAY
}: CashLedgerPopupProps) {
    const { showAlert } = useAlert();

    

  
  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay flex justify-center align-items-start short-version ${className}`} onClick={onClose}>
      <div
        className="confirm-cash-ledger-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2">
          <h2 className="popup-title">{action === Action.EDIT ? "Edytuj Kasetkę" : "Sprawdź zgodność"}</h2>
          <button className="popup-close-button  transparent border-none flex align-items-center justify-center absolute pointer" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="remove-product-popup-interior width-90 mb-1 justify-center">
          
          <CashLedgerForm
            cashLedger={cashLedger as CashLedger}
            setCashLedger={setCashLedger}
            action={action}
          />




        </section>
            <section className="footer-popup-action-buttons width-60 flex space-between mt-05 mb-05">
              <div className="footer-cancel-button">
                <ActionButton
                  src={"src/assets/cancel.svg"}
                  alt={"Anuluj"}
                  text={"Anuluj"}
                  onClick={onClose}
                />
              </div>
              <div className="footer-confirm-button">
                <ActionButton
                  src={"src/assets/tick.svg"}
                  alt={"Zatwierdź"}
                  text={"Zatwierdź"}
                  onClick={handleCloseCashLedger}
                />
              </div>
            </section>
         
      </div>
    </div>,
    portalRoot
  );
};

export default CashLedgerPopup;
