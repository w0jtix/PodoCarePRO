import React from "react";
import { useState, useCallback } from "react";
import ActionButton from "../ActionButton";
import EditOrderPopup from "../Popups/EditOrderPopup";
import RemoveOrderPopup from "../Popups/RemoveOrderPopup";
import { ListAttribute } from "../../constants/list-headers";
import RemovePopup from "../../components/Popups/RemovePopup";
import { Action } from "../../models/action";
import { calculateExpenseItems } from "../../utils/expenseUtils";
import { formatDate } from "../../utils/dateUtils";
import { CompanyExpense, expenseCategoryItems } from "../../models/expense";
import ExpenseContent from "./ExpenseContent";

export interface ExpensesListProps {
  attributes: ListAttribute[];
  expenses: CompanyExpense[];
  className?: string;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  setEditExpenseId: React.Dispatch<React.SetStateAction<number | null>>;
  setRemoveExpenseId: React.Dispatch<React.SetStateAction<number | null>>;
}

export function ExpensesList({
  attributes,
  expenses,
  className = "",
  onScroll,
  isLoading = false,
  hasMore = true,
  setEditExpenseId,
  setRemoveExpenseId,
}: ExpensesListProps) {
  const [expandedExpenseIds, setExpandedExpenseIds] = useState<number[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<CompanyExpense | null>(
    null
  );

  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, expense: CompanyExpense) => {
      e.stopPropagation();
      setEditExpenseId(expense.id);
    },
    [setEditExpenseId]
  );

  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, expense: CompanyExpense) => {
      e.stopPropagation();
      setRemoveExpenseId(expense.id);
    },
    [setRemoveExpenseId]
  );

  const toggleExpenses = (expenseId: number) => {
    setExpandedExpenseIds((prevIds) =>
      prevIds.includes(expenseId)
        ? prevIds.filter((id) => id !== expenseId)
        : [...prevIds, expenseId]
    );
  };

  const renderAttributeContent = (
    attr: ListAttribute,
    expense: CompanyExpense
  ): React.ReactNode => {
    switch (attr.name) {

      case " ":
        const categoryColor = expenseCategoryItems.find(
          (item) => item.id === expense.category
        )?.color;
        return (
          <span
            className="color-symbol invoice"
            style={{
              backgroundColor: `rgb(${categoryColor})`,
            }}
          />
        );

      case "Dostawca":
        return (
          <div className= "flex align-items-center g-2">
            <span className="qv-span">
            {expense.source}
          </span>
          <span className="qv-span op-lower">
            {expense.invoiceNumber}
          </span>
          </div>
        );

      case "Data Zamówienia":
        return (
          <span className="qv-span">
            {formatDate(expense.expenseDate)}
          </span> 
        );

      case "Produkty":
        return `${calculateExpenseItems(expense)}`;

      case "Netto":
        return (
          <span className="order-values-lower-font-size">
            {expense.totalNet.toFixed(2)}
          </span>
        );

      case "VAT":
        return (
          <span className="order-values-lower-font-size">
            {expense.totalVat.toFixed(2)}
          </span>
        );

      case "Brutto":
        return (
          <span className="order-values-lower-font-size">
            {expense.totalValue.toFixed(2)}
          </span>
        );

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons flex">
            <ActionButton
              src={"src/assets/edit.svg"}
              alt={"Edytuj Produkt"}
              iconTitle={"Edytuj Produkt"}
              text={"Edytuj"}
              onClick={(e) => handleOnClickEdit(e, expense)}
              disableText={true}
            />
            <ActionButton
              src={"src/assets/cancel.svg"}
              alt={"Usuń Produkt"}
              iconTitle={"Usuń Produkt"}
              text={"Usuń"}
              onClick={(e) => handleOnClickRemove(e, expense)}
              disableText={true}
            />
          </div>
        );

      default:
        return <span>{"-"}</span>;
    }
  };

  return (
    <div
      className={`item-list order width-93 grid p-0 mt-05 ${
        expenses.length === 0 ? "border-none" : ""
      } ${className}`}
      onScroll={onScroll}
    >
      {expenses.map((expense) => (
        <div key={expense.id} className={`product-wrapper order ${className}`}>
          <div
            className={`item order align-items-center flex-column ${
              expense.expenseItems.length > 0 ? "pointer" : ""
            } ${className}`}
            onClick={() => toggleExpenses(expense.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && expense.expenseItems.length > 0) {
                toggleExpenses(expense.id);
              }
            }}
          >
            <div className="height-max width-max justify-center align-items-center flex">
              {attributes.map((attr) => (
                <div
                  key={`${expense.id}-${attr.name}`}
                  className={`attribute-item flex ${
                    attr.name === "" ? "category-column" : ""
                  } ${className}`}
                  style={{
                    width: attr.width,
                    justifyContent: attr.justify,
                  }}
                >
                  {renderAttributeContent(attr, expense)}
                </div>
              ))}
            </div>
            {expandedExpenseIds.includes(expense.id) && (
            <ExpenseContent expense={expense} action={Action.HISTORY} />
          )}
          </div>
        </div>
      ))}

      {isLoading && (
        <span className="qv-span text-align-center">Ładowanie...</span>
      )}
    </div>
  );
}

export default ExpensesList;
