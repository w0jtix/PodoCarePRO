import ReactDOM from "react-dom";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import { OrderHistory } from "../Orders/OrderHistory";
import { ORDER_HISTORY_POPUP_ATTRIBUTES } from "../../constants/list-headers";
import { Order } from "../../models/order";

export interface OrderHistoryPopupProps {
  onClose: () => void;
  onSelect: (order: Order) => void;
  selectedOrderId?: number | null;
  className?: string;
}

export function OrderHistoryPopup({
  onClose,
  onSelect,
  selectedOrderId,
  className = "",
}: OrderHistoryPopupProps) {
  const { showAlert } = useAlert();

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay flex justify-center align-items-start ${className}`}
      
    >
      <div
        className="manage-order-history-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-1">
          <h2 className="popup-title">Historia zamówień</h2>
          <button
            className="popup-close-button transparent border-none flex align-items-center justify-center absolute pointer"
            onClick={onClose}
          >
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <OrderHistory
          attributes={ORDER_HISTORY_POPUP_ATTRIBUTES}
          onSelect={onSelect}
          selectedOrderId={selectedOrderId}
        />
      </div>
    </div>,
    portalRoot
  );
}

export default OrderHistoryPopup;
