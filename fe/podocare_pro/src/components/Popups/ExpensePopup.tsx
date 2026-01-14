import { useState, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import { Action } from "../../models/action";
import { AlertType } from "../../models/alert";
import { validateExpenseForm } from "../../utils/validators";
import { useAlert } from "../Alert/AlertProvider";
import { CompanyExpense, NewCompanyExpense } from "../../models/expense";
import ExpenseService from "../../services/ExpenseService";
import ExpenseForm from "../Business/ExpenseForm";

export interface ExpensePopupProps {
  onClose: () => void;
  onReset: () => void;
  expenseId?: number | null;
  className?: string;
}

export function ExpensePopup({
  onClose,
  onReset,
  expenseId,
  className = "",
}: ExpensePopupProps) {
  const [fetchedExpense, setFetchedExpense] = useState<CompanyExpense | null>(
    null
  );
  const [expenseDTO, setExpenseDTO] = useState<NewCompanyExpense>({
    source: "",
    expenseDate: new Date().toISOString().split("T")[0],
    invoiceNumber: null,
    category: null,
    expenseItems: [],
  });
  const { showAlert } = useAlert();

  const action = expenseId ? Action.EDIT : Action.CREATE;

  const fetchExpenseById = async (expenseId: number) => {
    ExpenseService.getExpenseById(expenseId)
      .then((data) => {
        setFetchedExpense(data);
        setExpenseDTO(data);
      })
      .catch((error) => {
        console.error("Error fetching Expense by id: ", error);
        showAlert("Błąd!", AlertType.ERROR);
      });
  };

  const handleExpenseAction = useCallback(async () => {
    if (!expenseDTO) return;
    try {
      const error = validateExpenseForm(expenseDTO, fetchedExpense, action);
      if (error) {
        showAlert(error, AlertType.ERROR);
        return;
      }
      if (action === Action.CREATE) {
        await ExpenseService.createExpense(expenseDTO as NewCompanyExpense);
        showAlert(`Koszt został utworzony!`, AlertType.SUCCESS);
        onReset();
      } else if (action === Action.EDIT && expenseId && fetchedExpense) {
        await ExpenseService.updateExpense(
          expenseId,
          expenseDTO as NewCompanyExpense
        );
        showAlert(`Koszt został zaktualizowany!`, AlertType.SUCCESS);
        onReset();
      }
      onClose();
    } catch (error) {
      console.error(
        `Error ${action === Action.CREATE ? "creating" : "updating"} expense:`,
        error
      );
      showAlert(
        `Błąd ${
          action === Action.CREATE ? "tworzenia" : "aktualizacji"
        } kosztu.`,
        AlertType.ERROR
      );
    }
  }, [expenseDTO, action, fetchedExpense, onReset, onClose, showAlert]);

  useEffect(() => {
    if (expenseId) {
      fetchExpenseById(expenseId);
    }
  }, [expenseId]);

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
        className="expense-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2">
          <h2 className="popup-title">
            {action === Action.CREATE ? "Nowa Faktura VAT" : "Edytuj Fakturę VAT"}
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
        <section className="product-popup-interior width-90 mb-1">
          <ExpenseForm
            action={action}
            expenseDTO={expenseDTO}
            setExpenseDTO={setExpenseDTO}
          />
        </section>
        <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={handleExpenseAction}
        />
      </div>
    </div>,
    portalRoot 
  );
}

export default ExpensePopup;
