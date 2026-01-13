import React from "react";
import { useState, useEffect, useCallback } from "react";
import TextInput from "../TextInput";
import { Action } from "../../models/action";
import { useAlert } from "../Alert/AlertProvider";
import { getCategoryTemplate } from "../../utils/expenseUtils";
import {
    CompanyExpense,
  ExpenseCategory,
  NewCompanyExpense,
  NewCompanyExpenseItem,
  expenseCategoryItems,
} from "../../models/expense";
import DropdownSelect from "../DropdownSelect";
import DateInput from "../DateInput";
import ActionButton from "../ActionButton";
import { VatRate } from "../../models/vatrate";
import ExpenseItemList from "./ExpenseItemList";
import { EXPENSE_ITEM_ATTRIBUTES } from "../../constants/list-headers";
import ExpenseService from "../../services/ExpenseService";
import { AlertType } from "../../models/alert";

export interface ExpenseFormProps {
  action: Action;
  className?: string;
  expenseDTO: NewCompanyExpense;
  setExpenseDTO: React.Dispatch<React.SetStateAction<NewCompanyExpense>>;
}

export function ExpenseForm({
  action,
  className = "",
  expenseDTO,
  setExpenseDTO,
}: ExpenseFormProps) {
  const { showAlert } = useAlert();
  const [expensePreview, setExpensePreview] = useState<CompanyExpense | null>(null);

  const fetchExpensePreview = async (expenseDTO: NewCompanyExpense) => {
      ExpenseService.getExpensePreview(expenseDTO)
        .then((data) => {
          setExpensePreview(data);
        })
        .catch((error) => {
          console.error("Error fetching order preview: ", error);
          showAlert("Błąd", AlertType.ERROR);
        })
  }

  const handleCategoryChange = useCallback(
    async (
      selected:
        | { id: ExpenseCategory; name: string }
        | { id: ExpenseCategory; name: string }[]
        | null
    ) => {
      const category = Array.isArray(selected)
        ? selected[0].id
        : selected
        ? selected.id
        : null;

      if (category) {
        const template = action === Action.CREATE ? await getCategoryTemplate(category) : {};
        setExpenseDTO((prev) => ({
          ...prev,
          category: category,
          ...template,
        }));
      } else {
        setExpenseDTO((prev) => ({
          ...prev,
          category: null,
        }));
      }
    },
    [action]
  );
  const handleSource = useCallback((source: string) => {
    setExpenseDTO((prev) => ({
      ...prev,
      source: source,
    }));
  }, []);
  const handleInvoiceNumber = useCallback((invoiceNumber: string | null) => {
    setExpenseDTO((prev) => ({
      ...prev,
      invoiceNumber: invoiceNumber,
    }));
  }, []);
  const handleExpenseDate = useCallback((expenseDate: string | null) => {
    if (expenseDate) {
      setExpenseDTO((prev) => ({
        ...prev,
        expenseDate: expenseDate,
      }));
    }
  }, []);
  const handleAddNewExpenseItem = useCallback(() => {
    setExpenseDTO((prev) => ({
      ...prev,
      expenseItems: [
        ...prev.expenseItems,
        {
          name: "",
          quantity: 1,
          vatRate: VatRate.VAT_23,
          price: 0,
        },
      ],
    }));
  }, []);

  const setExpenseItems: React.Dispatch<React.SetStateAction<NewCompanyExpenseItem[]>> = useCallback(
    (action) => {
      setExpenseDTO((prev) => ({
        ...prev,
        expenseItems: typeof action === "function" ? action(prev.expenseItems) : action,
      }));
    },
    []
  );

  useEffect(() => {
      fetchExpensePreview(expenseDTO);
    }, [expenseDTO])

  return (
    <div
      className={`product-form-container flex-column ${action
        .toString()
        .toLowerCase()} ${className}`}
    >
      <section className="flex width-max space-between align-items-center mb-1">
        <a className="order-history-action-buttons-a align-center">
          Kategoria:
        </a>
        <DropdownSelect
          items={expenseCategoryItems}
          value={
            expenseDTO.category
              ? expenseCategoryItems.filter(
                  (item) => expenseDTO.category === item.id
                )
              : null
          }
          onChange={handleCategoryChange}
          searchable={false}
          allowNew={false}
          multiple={false}
          placeholder="Wybierz"
          className="expense-category"
        />
      </section>
      <section className="flex width-max space-between align-items-center mb-1">
        <a className="product-form-input-title">Data:</a>
        <DateInput
          onChange={handleExpenseDate}
          selectedDate={expenseDTO.expenseDate}
        />
      </section>
      <section className="flex width-max space-between align-items-center mb-1">
        <a className="product-form-input-title">Dostawca:</a>
        <TextInput
          dropdown={false}
          value={expenseDTO.source}
          onSelect={(input) => {
            if (typeof input === "string") {
              handleSource(input);
            }
          }}
          className="invoice"
        />
      </section>
      <section className="flex width-max space-between align-items-center mb-1">
        <a className="product-form-input-title">Nr faktury:</a>
        <TextInput
          dropdown={false}
          value={expenseDTO.invoiceNumber ?? undefined}
          onSelect={(input) => {
            if (typeof input === "string") {
              handleInvoiceNumber(input);
            }
          }}
          className="invoice"
        />
      </section>
      <div className="addons-list-header invoice flex justify-end align-items-center">
        <ActionButton
          src={"src/assets/addNew.svg"}
          alt={"Nowa pozycja"}
          text={"Nowa pozycja"}
          onClick={handleAddNewExpenseItem}
        />
      </div>
      <ExpenseItemList
            expenseItems={expenseDTO.expenseItems}
            setExpenseItems={setExpenseItems}
            attributes={EXPENSE_ITEM_ATTRIBUTES}
      />
      <div className="order-cost-summary relative flex space-between align-items-center justify-end mt-1">
            <a>Netto:</a>
            <a className="order-total-value">{expensePreview?.totalNet ?? 0} zł</a>
            <a>VAT:</a>
            <a className="order-total-value">{expensePreview?.totalVat ?? 0} zł</a>
            <a>Total:</a>
            <a className="order-total-value">
              {expensePreview?.totalValue ?? 0} zł
            </a>
          </div>
    </div>
  );
}

export default ExpenseForm;
