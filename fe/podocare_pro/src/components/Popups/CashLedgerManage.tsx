import { useEffect, useState, useCallback, useMemo } from "react";
import { useAlert } from "../Alert/AlertProvider";
import ReactDOM from "react-dom";
import ListHeader from "../ListHeader";
import { AlertType } from "../../models/alert";
import { MONTHS, getYears } from "../../utils/dateUtils";
import {
  CASH_LEDGER_HISTORY_ATTRIBUTES
} from "../../constants/list-headers";
import DropdownSelect from "../DropdownSelect";
import CashLedgerPopup from "./CashLedgerPopup";
import { CashLedger, CashLedgerFilterDTO } from "../../models/cash_ledger";
import CashLedgerService from "../../services/CashLedgerService";
import CashLedgersList from "../CashLedger/CashLedgersList";
import { Action } from "../../models/action";
import { validateCashLedgerForm } from "../../utils/validators";

export interface CashLedgerManageProps {
  onClose: () => void;
  className?: string;
}

export function CashLedgerManage({
  onClose,
  className = "",
}: CashLedgerManageProps) {
  const [cashLedgers, setCashLedgers] = useState<CashLedger[]>([]);
  const [selectedCashLedger, setSelectedCashLedger] =
    useState<CashLedger | null>(null);
  const currentDate = new Date();
  const [filter, setFilter] = useState<CashLedgerFilterDTO>({
    isClosed: true,
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const { showAlert } = useAlert();

  const years = useMemo(() => getYears(), []);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const fetchCashLedgers = useCallback(
    async (pageNum: number = 0, append: boolean = false): Promise<void> => {
      CashLedgerService.getCashLedgers(filter, pageNum, 30)
        .then((data) => {
          const content = data?.content || [];
          if (append) {
            setCashLedgers((prev) => [...prev, ...content]);
          } else {
            setCashLedgers(content);
          }

          setHasMore(!data.last);
          setPage(pageNum);
        })
        .catch((error) => {
          if (!append) setCashLedgers([]);
          setHasMore(false);
          showAlert("Błąd", AlertType.ERROR);
          console.error("Error fetching Cash Ledgers:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [filter],
  );

  const disabledMonthIds = useMemo(() => {
    if (filter.year !== currentYear) return [];
    return MONTHS.filter((m) => m.id > currentMonth).map((m) => m.id);
  }, [filter.year, currentYear, currentMonth]);

  useEffect(() => {
    fetchCashLedgers(0, false);
    setPage(0);
    setHasMore(true);
  }, [filter, fetchCashLedgers]);

  const handleMonthChange = useCallback(
    (
      selected:
        | { id: number; name: string }
        | { id: number; name: string }[]
        | null,
    ) => {
      const month = Array.isArray(selected) ? selected[0]?.id : selected?.id;
      setFilter((prevFilter) => ({
        ...prevFilter,
        month: month ?? null,
      }));
    },
    [],
  );
  const handleYearChange = useCallback(
    (
      selected:
        | { id: number; name: string }
        | { id: number; name: string }[]
        | null,
    ) => {
      const year = Array.isArray(selected) ? selected[0]?.id : selected?.id;
      setFilter((prevFilter) => ({
        ...prevFilter,
        year: year ?? null,
      }));
    },
    [],
  );

  const handleEditCashLedger = useCallback(async () => {
    if(!selectedCashLedger || !selectedCashLedger.id) return;
    const cashLedgerBeforeUpdate = cashLedgers.find((cl) => cl.id === selectedCashLedger.id);
    const error = validateCashLedgerForm(selectedCashLedger, cashLedgerBeforeUpdate as CashLedger, Action.EDIT);
        if (error) {
          showAlert(error, AlertType.ERROR);
          return null;
        }
    CashLedgerService.updateCashLedger(selectedCashLedger.id, selectedCashLedger)
    .then((data) => {
        showAlert("Pomyślnie zaktualizowano Kasetkę!", AlertType.SUCCESS);
        setSelectedCashLedger(null);
        setFilter({
          isClosed: true,
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  })
  fetchCashLedgers();
    })
    .catch((error) => {
        showAlert("Błąd aktualizacji Kasetki!", AlertType.ERROR);
        console.error("Error updating Cash Ledger", error);
    })
  },[selectedCashLedger])

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrolledToBottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 100; // 100px b4 end of the list

      if (scrolledToBottom && hasMore && !loading) {
        fetchCashLedgers(page + 1, true);
      }
    },
    [hasMore, loading, page, filter],
  );

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
        className="cash-ledger-history-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-1">
          <h2 className="popup-title">Historia Kasetki</h2>
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
        <section className="width-90 flex g-2 justify-center mb-2 mt-05">
          <section className="order-history-action-button-title flex g-15px">
            <span className="qv-span align-center">Miesiąc:</span>
            <DropdownSelect
              items={MONTHS}
              value={
                filter.month
                  ? (MONTHS.find((m) => m.id === filter.month) ?? null)
                  : null
              }
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
            <span className="qv-span  align-center">Rok:</span>
            <DropdownSelect
              items={years}
              value={
                filter.year
                  ? (years.find((y) => y.id === filter.year) ?? null)
                  : null
              }
              onChange={handleYearChange}
              searchable={false}
              allowNew={false}
              placeholder="Wybierz"
              className="expense-year"
            />
          </section>
        </section>
        <div className="flex-column width-max f-1 align-items-center min-height-0 mb-1">
        <ListHeader attributes={CASH_LEDGER_HISTORY_ATTRIBUTES} customWidth="width-93"/>
        <CashLedgersList
          items={cashLedgers}
          setSelectedCashLedger={setSelectedCashLedger}
          attributes={CASH_LEDGER_HISTORY_ATTRIBUTES}
          onScroll={handleScroll}
          isLoading={loading}
          hasMore={hasMore}
          className="products cl-list"
        />
        </div>
      </div>

      {selectedCashLedger != null && (
        <CashLedgerPopup
          onClose={() => {
            setSelectedCashLedger(null);
          }}
          className=""
          handleCloseCashLedger={handleEditCashLedger}
          cashLedger={selectedCashLedger as CashLedger}
          setCashLedger={setSelectedCashLedger}
          action={Action.EDIT}
        />
      )}
    </div>,
    portalRoot,
  );
}

export default CashLedgerManage;
