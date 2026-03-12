import ListHeader, { ListModule } from "../ListHeader";
import HandyExpenseItemList from "./HandyExpenseItemList";
import { EXPENSE_HANDY_HISTORY_ATTRIBUTES, EXPENSE_POPUP_HISTORY_ATTRIBUTES } from "../../constants/list-headers";
import { Action, Mode } from "../../models/action";
import { CompanyExpense } from "../../models/expense";

export interface ExpenseContentProps {
  expense: CompanyExpense;
  action: Action;
  mode?: Mode;
}

export function ExpenseContent ({
  expense,
  action,
  mode = Mode.NORMAL,
}: ExpenseContentProps) {
  const getAttributes = () => {
    if (action === Action.HISTORY) {
      return mode === Mode.POPUP
            ? EXPENSE_POPUP_HISTORY_ATTRIBUTES
            : EXPENSE_HANDY_HISTORY_ATTRIBUTES;
    }
    return EXPENSE_HANDY_HISTORY_ATTRIBUTES;
  }

  const attributes = getAttributes();


  return (
    <div className={`expense-content width-max mt-025 ${Action[action].toLowerCase()}`}>
      <ListHeader
        attributes={attributes}
        module={ListModule.HANDY}
      />
      <HandyExpenseItemList
        attributes={attributes}
        expense={expense}
        action={action}
        mode={mode}
      />
    </div>
  );
};

export default ExpenseContent;
