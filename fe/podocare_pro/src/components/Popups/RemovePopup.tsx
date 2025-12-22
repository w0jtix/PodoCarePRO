import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";

export interface RemovePopupProps {
  onClose: () => void;
  /* selectedItem?: Product | BaseService | Client | null; */
  warningText?: string;
  footerText?: React.ReactNode;
  handleRemove:() => void;
  className?: string;
}

export function RemovePopup ({
  onClose,
  /* selectedItem, */
  warningText="",
  footerText,
  handleRemove,
  className = ""
}: RemovePopupProps) {
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
        className="remove-product-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2">
          <h2 className="popup-title">Na pewno? ⚠️</h2>
          <button className="popup-close-button  transparent border-none flex align-items-center justify-center absolute pointer" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="remove-product-popup-interior width-90 mb-1">
          <section>
            <a className="remove-popup-warning-a flex justify-center text-align-center">
              {warningText}
            </a>
            <br />
          </section>
        </section>
            <section className="footer-popup-action-buttons width-60 flex space-between mb-05">
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
                  onClick={handleRemove}
                />
              </div>
            </section>
            {footerText && (
              <a className="popup-category-description flex justify-center width-max">
              {footerText}
            </a>
            )}
         
      </div>
    </div>,
    portalRoot
  );
};

export default RemovePopup;
