import { Client } from "../../models/client";
import { useState, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import DebtForm from "../Clients/DebtForm";
import { DebtType, NewClientDebt } from "../../models/debt";
import { validateNoSourceClientDebtForm } from "../../utils/validators";
import ClientDebtService from "../../services/ClientDebtService";
import { PaymentStatus } from "../../models/payment";
import { ClientDebt } from "../../models/debt";
import { Action } from "../../models/action";

export interface DebtPopupProps {
  onClose: () => void;
  clients:Client[];
  debtId?: number | string | null;
  className: string;
}

export function DebtPopup({
  onClose,
  clients,
  debtId,
  className = "",
}: DebtPopupProps) {
  const [fetchedDebt, setFetchedDebt] = useState<ClientDebt | null>(null)
  const [debtDTO, setDebtDTO] = useState<NewClientDebt>({
    type: DebtType.UNPAID,
    value: 0,
    client: undefined,
    createdAt: "",
    paymentStatus: PaymentStatus.UNPAID
  });
  const { showAlert } = useAlert();

  const action = debtId ? Action.EDIT : Action.CREATE;

  const fetchDebtById = async (debtId: number | string) => {
    ClientDebtService.getDebtById(debtId)
      .then ((data) => {
        setFetchedDebt(data);
        setDebtDTO(data);
      })
      .catch((error) => {
        console.error("Error fetching Debt: ", error);
        showAlert("Błąd!", AlertType.ERROR)
      })
    }

  const handleCreateDebt = useCallback(async() => {
    const error = validateNoSourceClientDebtForm(
      debtDTO,
      action,
      fetchedDebt
    );
    if(error) {
      showAlert(error, AlertType.ERROR);
      return;
    }
    try {
      if(action === Action.CREATE) {
        await ClientDebtService.createDebt(debtDTO as NewClientDebt);
      showAlert(`Dług klienta ${debtDTO.client?.firstName + " " + debtDTO.client?.lastName} utworzony!`, AlertType.SUCCESS);
      } else if (action === Action.EDIT && fetchedDebt) {
        await ClientDebtService.updateDebt(fetchedDebt.id ,debtDTO as NewClientDebt);
      showAlert(`Dług zaktualizowany!`, AlertType.SUCCESS);
      }
      
      onClose();
    } catch (error) {
      showAlert(`Błąd ${action === Action.CREATE ? "tworzenia" : "aktualizacji"} długu!`, AlertType.ERROR);
    }

  },[debtDTO, showAlert, fetchedDebt, action])

  useEffect(() => {
    if(debtId) {
      fetchDebtById(debtId);
    }
  }, [])

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }
return ReactDOM.createPortal(
    <div className={`add-popup-overlay flex justify-center align-items-start ${className}`} onClick={onClose}>
      <div
        className="client-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2">
          <h2 className="popup-title">
            {action === Action.CREATE ? "Nowy Dług" : "Edytuj Dług"}
          </h2>
          <button className="popup-close-button transparent border-none flex align-items-center justify-center absolute pointer" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="custom-form-section width-90 mb-15">
          <DebtForm
            setDebtDTO={setDebtDTO}
            debtDTO={debtDTO}
            clients={clients}
            className={""}
            action={action}
          />
        </section>

        <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={handleCreateDebt}
        />
      </div>
    </div>,
    portalRoot
  );
}

export default DebtPopup;

