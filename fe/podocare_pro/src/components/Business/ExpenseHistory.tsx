import { useAlert } from "../Alert/AlertProvider";
import { useState, useCallback, useEffect, useMemo } from "react";
import { CompanyExpense, ExpenseFilterDTO, expenseCategoryItems, ExpenseCategory } from "../../models/expense";
import ExpenseService from "../../services/ExpenseService";
import { AlertType } from "../../models/alert";
import ListHeader from "../ListHeader";
import { EXPENSE_HISTORY_ATTRIBUTES } from "../../constants/list-headers";
import ActionButton from "../ActionButton";
import DropdownSelect from "../DropdownSelect";
import { MONTHS, getYears } from "../../utils/dateUtils";
import RemovePopup from "../Popups/RemovePopup";
import ExpensePopup from "../Popups/ExpensePopup";
import ExpensesList from "./ExpensesList";


export function ExpenseHistory() {
  const { showAlert } = useAlert();
  const [expenses, setExpenses] = useState<CompanyExpense[]>([]);
  const currentDate = new Date();
  const [filter, setFilter] = useState<ExpenseFilterDTO>({
    categories: null,
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });
  const [isAddNewExpensePopupOpen, setIsAddNewExpensePopupOpen] =
      useState<boolean>(false);
  const [editExpenseId, setEditExpenseId] =
      useState<number | null>(null);
    const [removeExpenseId, setRemoveExpenseId] =
      useState<number | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const years = useMemo(() => getYears(), []);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const handleResetFiltersAndData = useCallback(() => {
    const now = new Date();
    setFilter({
      categories: null,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
    setPage(0);
    setHasMore(true);
  }, []);

  const fetchExpenses = useCallback(
    async (pageNum: number = 0, append: boolean = false) => {
      setLoading(true);
      ExpenseService.getExpenses(filter, pageNum, 30)
        .then((data) => {
          const content = data?.content || [];

          if (append) {
            setExpenses((prev) => [...prev, ...content]);
          } else {
            setExpenses(content);
          }

          setHasMore(!data.last);
          setPage(pageNum);
          setLoading(false);
        })
        .catch((error) => {
          if (!append) setExpenses([]);
          setLoading(false);
          showAlert("Błąd", AlertType.ERROR);
          console.error("Error fetching Expenses:", error);
        });
    },
    [filter]
  );

  const disabledMonthIds = useMemo(() => {
      if (filter.year !== currentYear) return [];
      return MONTHS.filter((m) => m.id > currentMonth).map((m) => m.id);
    }, [filter.year, currentYear, currentMonth]);

  useEffect(() => {
      fetchExpenses(0, false);
      setPage(0);
      setHasMore(true);
    }, [filter, fetchExpenses]);

  const handleMonthChange = useCallback(
    (selected: { id: number; name: string } | { id: number; name: string }[] | null) => {
      const month = Array.isArray(selected) ? selected[0]?.id : selected?.id;
      setFilter((prevFilter) => ({
        ...prevFilter,
        month: month ?? null,
      }));
    },
    []
  );

  const handleYearChange = useCallback(
    (selected: { id: number; name: string } | { id: number; name: string }[] | null) => {
      const year = Array.isArray(selected) ? selected[0]?.id : selected?.id;
      setFilter((prevFilter) => ({
        ...prevFilter,
        year: year ?? null,
      }));
    },
    []
  );

  const handleCategoryChange = useCallback(
    (selected: { id: ExpenseCategory; name: string } | { id: ExpenseCategory; name: string }[] | null) => {
      const categories = Array.isArray(selected)
        ? selected.map(item => item.id)
        : selected
        ? [selected.id]
        : null;

      setFilter((prevFilter) => ({
        ...prevFilter,
        categories: categories,
      }));
    },
    []
  );

  const handleExpenseRemove = useCallback(async() => {
    if(!removeExpenseId) return;
    ExpenseService.deleteExpense(removeExpenseId)
      .then(() => {
        showAlert("Pomyślnie usunięto Koszt!", AlertType.SUCCESS);
        setRemoveExpenseId(null);
        fetchExpenses();
        handleResetFiltersAndData();
      })
      .catch((error) => {
        showAlert("Błąd usuwania Kosztu!", AlertType.ERROR);
        console.error("Error removing Expense", error);
      })
  },[removeExpenseId])

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const scrolledToBottom = 
          target.scrollHeight - target.scrollTop <= target.clientHeight + 100; // 100px b4 end of the list
    
        if (scrolledToBottom && hasMore && !loading) {
          fetchExpenses(page + 1, true);
        }
      }, [hasMore, loading, page, filter]);

  return (
  <>
  <section className="width-90 flex align-self-center mt-1 mb-1 space-between">
    <ActionButton
                src={"src/assets/addNew.svg"}
                alt={"Nowa Faktura Kosztowa"}
                text={"Nowa Faktura Kosztowa"}
                onClick={() => setIsAddNewExpensePopupOpen(true)}
              />
    <section className="order-history-action-button-title flex g-15px">
      <a className="order-history-action-buttons-a align-center">Kategoria:</a>
      <DropdownSelect
        items={expenseCategoryItems}
        value={
          filter.categories
            ? expenseCategoryItems.filter((item) =>
                filter.categories?.includes(item.id)
              )
            : null
        }
        onChange={handleCategoryChange}
        searchable={false}
        allowNew={false}
        multiple={true}
        placeholder="Wybierz"
        className="expense-category"
      />
    </section>
    <section className="order-history-action-button-title flex g-15px">
      <a className="order-history-action-buttons-a align-center">Miesiąc:</a>
      <DropdownSelect
        items={MONTHS}
        value={filter.month ? MONTHS.find((m) => m.id === filter.month) ?? null : null}
        onChange={handleMonthChange}
        searchable={false}
        allowNew={false}
        placeholder="Wybierz"
        className="expense-month"
        divided={true}
        disabledItemIds={disabledMonthIds}
      />
    </section>
    <section className="order-history-action-button-title flex g-15px">
      <a className="order-history-action-buttons-a align-center">Rok:</a>
      <DropdownSelect
        items={years}
        value={filter.year ? years.find((y) => y.id === filter.year) ?? null : null}
        onChange={handleYearChange}
        searchable={false}
        allowNew={false}
        placeholder="Wybierz"
        className="expense-year"
      />
    </section>
    <ActionButton
      src={"src/assets/reset.svg"}
      alt={"Reset"}
      iconTitle={"Resetuj filtry"}
      text={"Reset"}
      onClick={handleResetFiltersAndData}
      disableText={true}
    />
  </section>
  <ListHeader attributes={EXPENSE_HISTORY_ATTRIBUTES} />
  <ExpensesList
      attributes={EXPENSE_HISTORY_ATTRIBUTES}
      expenses={expenses}
      onScroll={handleScroll}
      isLoading={loading}
      hasMore={hasMore}
      setEditExpenseId={setEditExpenseId}
      setRemoveExpenseId={setRemoveExpenseId}      
      className="products expenses"
  />
  {isAddNewExpensePopupOpen && (
        <ExpensePopup
          onClose={() => setIsAddNewExpensePopupOpen(false)}
          onReset={handleResetFiltersAndData}
        />
      )}
  {editExpenseId != null && (
        <ExpensePopup
          onClose={() => setEditExpenseId(null)}
          onReset={handleResetFiltersAndData}
          expenseId={editExpenseId}
        />
      )}
      {removeExpenseId != null && (
        <RemovePopup
          onClose={() => setRemoveExpenseId(null)}
          warningText={
            "Zatwierdzenie spowoduje usunięcie Kosztu z bazy danych!"
          }
          handleRemove={handleExpenseRemove}
        />
      )}
  </>
  );
}

export default ExpenseHistory;
