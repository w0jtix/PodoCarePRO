import { useState, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import { Action } from "../../models/action";
import { NewDiscount, Discount } from "../../models/visit";
import { validateDiscountForm } from "../../utils/validators";
import DiscountService from "../../services/DiscountService";
import DiscountForm from "../Clients/DiscountForm";
import { Alert } from "react-bootstrap";

export interface DiscountPopupProps {
  onClose: () => void;
  discountId?: number | string | null;
  className: string;
}

export function DiscountPopup({
  onClose,
  discountId,
  className = "",
}: DiscountPopupProps) {
  const [fetchedDiscount, setFetchedDiscount] = useState<Discount | null>(null);
  const [discountDTO, setDiscountDTO] = useState<NewDiscount>({
    name: "",
    percentageValue: 0,
    clients: [],
  });
  const { showAlert } = useAlert();

  const action = discountId ? Action.EDIT : Action.CREATE;

  const fetchDiscountById = async (discountId: number | string) => {
    DiscountService.getDiscountById(discountId)
    .then((data) => {
      setFetchedDiscount(data);
      setDiscountDTO((prev) => ({
        ...prev,
        name: data.name,
        percentageValue: data.percentageValue,
        // does not include clients - they are loaded in DiscountForm
      }));
  })
    .catch((error) => {
      console.error("Error fetching Discount: ", error);
      showAlert("Błąd!", AlertType.ERROR);
    })
  }

  const handleDiscountAction = useCallback(async () => {
    const error = validateDiscountForm(discountDTO, action, fetchedDiscount);
    if (error) {
      showAlert(error, AlertType.ERROR);
      return;
    }
    try {
      if (action === Action.CREATE) {
        await DiscountService.createDiscount(discountDTO as NewDiscount);
        showAlert(
          `Rabat utworzony!`,
          AlertType.SUCCESS
        );
      } else if (action === Action.EDIT && fetchedDiscount) {
        await DiscountService.updateDiscount(
          fetchedDiscount.id,
          discountDTO as NewDiscount
        );
        showAlert(`Rabat zaktualizowany!`, AlertType.SUCCESS);
      }
      onClose();
    } catch (error) {
      showAlert(
        `Błąd ${
          action === Action.CREATE ? "tworzenia" : "aktualizacji"
        } rabatu!`,
        AlertType.ERROR
      );
    }
  }, [discountDTO, showAlert, fetchedDiscount, action]);

  useEffect(() => {
    if (discountId) {
      fetchDiscountById(discountId);
    }
  }, []);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }
  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay flex justify-center align-items-start ${className}`}
      onClick={onClose}
    >
      <div
        className="discount-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2">
          <h2 className="popup-title">
            {action === Action.CREATE ? "Nowy Rabat" : "Edytuj Rabat"}
          </h2>
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
        <section className="custom-form-section width-90 mb-15">
          <DiscountForm
            selectedDiscountId={discountId}
            discountDTO={discountDTO}
            setDiscountDTO={setDiscountDTO}
            action={action}
            className=''
          />
        </section>

        <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={handleDiscountAction}
        />
      </div>
    </div>,
    portalRoot
  );
}

export default DiscountPopup;
