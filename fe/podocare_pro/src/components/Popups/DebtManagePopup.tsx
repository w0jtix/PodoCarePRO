import { useEffect, useState, useCallback } from "react";
import { ClientDebt, DebtFilterDTO } from "../../models/debt";
import { useAlert } from "../Alert/AlertProvider";
import ActionButton from "../ActionButton";
import ReactDOM from "react-dom";
import ListHeader from "../ListHeader";
import { DEBTS_LIST_ATTRIBUTES } from "../../constants/list-headers";
import { Client } from "../../models/client";
import DebtPopup from "./DebtPopup";
import ClientDebtService from "../../services/ClientDebtService";
import DebtsList from "../Clients/DebtsList";
import RemovePopup from "./RemovePopup";
import { AlertType } from "../../models/alert";
import { PaymentStatus } from "../../models/payment";
import SearchBar from "../SearchBar";

export interface DebtManagePopupProps {
  onClose: () => void;
  onReset: () => void;
  clients: Client[];
  className?: string;
}

export function DebtManagePopup({
  onClose,
  onReset,
  clients,
  className = "",
}: DebtManagePopupProps) {
  const [isAddNewDebtPopupOpen, setIsAddNewDebtPopupOpen] =
    useState<boolean>(false);
  const [editDebtId, setEditDebtId] = useState<number | string | null>(null);
  const [removeDebtId, setRemoveDebtId] = useState<number | string | null>(null);
  const [debts, setDebts] = useState<ClientDebt[]>([]);
  const [filter, setFilter] = useState<DebtFilterDTO>({
      paymentStatus: null,
      keyword: ""
    });
  const { showAlert } = useAlert();

  const fetchDebts = async (): Promise<void> => {
    ClientDebtService.getDebts(filter)
      .then((data) => {
        const sortedData = data.sort((a, b) => b.id - a.id);
        console.log(sortedData);
        setDebts(sortedData);
      })
      .catch((error) => {
        setDebts([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching Debts: ", error);
      });
  };

  const handleKeywordChange = useCallback((newKeyword: string) => {
    setFilter((prev) => ({
      ...prev,
      keyword: newKeyword,
    }));
  }, []);

  const toggleStatus = () => {
    setFilter((prev) => {
    let nextStatus: PaymentStatus | null = null;

    if (prev.paymentStatus === null) nextStatus = PaymentStatus.UNPAID;
    else if (prev.paymentStatus === PaymentStatus.UNPAID) nextStatus = PaymentStatus.PAID;
    else nextStatus = null;

    return { ...prev, paymentStatus: nextStatus };
  });
  };

  const handleDebtRemove = useCallback(async (): Promise<void> => {
    try{
      if(removeDebtId != null) {
        await ClientDebtService.removeDebt(removeDebtId);
        showAlert('Pomyślnie usunięto dług!', AlertType.SUCCESS);
        setRemoveDebtId(null);
        fetchDebts();
        onReset();
      }
    } catch (error) {
      showAlert("Błąd usuwania długu!", AlertType.ERROR);
    }
  },[removeDebtId])

  useEffect(() => {
    fetchDebts();
  }, []);

  useEffect(() => {
    fetchDebts();
  }, [filter]);

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
        className="debt-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-1">
          <h2 className="popup-title">Zarządzaj Długami</h2>
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
        <section className="flex width-90 space-between mb-1 g-2">
          <ActionButton
            src={"src/assets/filter_icon.svg"}
            alt={"Status"}
            text={`Status: ${filter.paymentStatus === null ? "wszystkie" : filter.paymentStatus === PaymentStatus.PAID ? "opłacone" : "nieopłacone"}`}
            onClick={toggleStatus}
            className={`${filter.paymentStatus === null ? "" : filter.paymentStatus === PaymentStatus.PAID ? "paid" : "unpaid"}`}
          />
          <SearchBar
                      onKeywordChange={handleKeywordChange}
                    /> 
          <ActionButton
            src={"src/assets/addNew.svg"}
            alt={"Nowy Dług"}
            text={"Nowy Dług"}
            onClick={() => setIsAddNewDebtPopupOpen(true)}
          />
        </section>
        <ListHeader attributes={DEBTS_LIST_ATTRIBUTES} />
        <DebtsList
          attributes={DEBTS_LIST_ATTRIBUTES}
          items={debts}
          className="products popup-list"
          setEditDebtId={setEditDebtId}
          setRemoveDebtId={setRemoveDebtId}
        />
        <span className="popup-category-description flex justify-center width-max flex-grow align-items-end">
          Długi powstały podczas Wizyty może być usunięty tylko z Wizytą!
        </span>
      </div>

      {isAddNewDebtPopupOpen && (
        <DebtPopup
          onClose={() => {
            setIsAddNewDebtPopupOpen(false);
            fetchDebts();
            onReset();
          }}
          clients={clients}
          className=""
        />
      )}
      {editDebtId != null && (
        <DebtPopup
          onClose={() => {
            setEditDebtId(null);
            fetchDebts();
            onReset();
          }}
          clients={clients}
          className=""
          debtId={editDebtId}
        />
      )}
      {removeDebtId != null && (
        <RemovePopup
          onClose={() => {
            setRemoveDebtId(null);
          }}
          className=""
          handleRemove={handleDebtRemove}
          warningText={
            "Zatwierdzenie spowoduje usunięcie Długu z bazy danych!"
          }
        />
      )}
    </div>,
    portalRoot
  );
}

export default DebtManagePopup;
