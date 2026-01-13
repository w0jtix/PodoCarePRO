import React from "react";
import { ListAttribute } from "../../constants/list-headers";
import { CompanyExpense, CompanyExpenseItem, expenseCategoryItems } from "../../models/expense";
import { Action, Mode } from "../../models/action";
import { getVatRateDisplay } from "../../models/vatrate";
import { calculateNetPrice } from "../../utils/priceUtils";

export interface HandyExpenseItemListProps {
  attributes: ListAttribute[];
  expense: CompanyExpense;
  action: Action;
  mode?: Mode;
  className?: string;
}

export function HandyExpenseItemList({
  attributes,
  expense,
  action,
  mode = Mode.NORMAL,
  className = "",
}: HandyExpenseItemListProps) {

  const renderAttributeContent = (
    attr: ListAttribute,
    expenseItem: CompanyExpenseItem,
    index: number
  ): React.ReactNode => {
    switch (attr.name) {

      case "":
        const categoryColor = expenseCategoryItems.find(
                  (item) => item.id === expense.category
                )?.color;
                return (
                  <span
                    className="color-symbol"
                    style={{
                      backgroundColor: `rgb(${categoryColor})`,
                    }}
                  />
                );

      case "Nazwa":
        return (
          <span className="expense-item-list-span">
            {expenseItem.name}
          </span>
        );

      case "Ilość":
        return (
          <span className="expense-item-list-span">
            {expenseItem.quantity}
          </span>
        );

      case "Netto [szt]":
        return (
          <span className="expense-item-list-span">
            {calculateNetPrice(expenseItem.price, expenseItem.vatRate)}
          </span>
        );

      case "VAT":
        return (
          <span className="expense-item-list-span">
            {getVatRateDisplay(expenseItem.vatRate)}
          </span>
        );

      case "Cena [szt]":
        return (
          <span className="expense-item-list-span">
            {expenseItem.price.toFixed(2)}
          </span>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`handy-expense-item-list-container flex-column ${
        mode === Mode.POPUP ? "popup" : ""
      } ${className}`}
    >
      {expense.expenseItems.map((expenseItem, index) => {
        return (
          <div
            key={`${expenseItem.id}-${index}`}
            className="handy-expense-item flex"
          >
            {attributes.map((attr) => (
              <div
                key={`${expense.id}-${attr.name}`}
                className="attribute-item flex expense"
                style={{
                  width: attr.width,
                  justifyContent: attr.justify,
                }}
              >
                {renderAttributeContent(attr, expenseItem, index)}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default HandyExpenseItemList;
