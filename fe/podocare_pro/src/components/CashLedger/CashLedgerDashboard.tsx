import NavigationBar from "../NavigationBar";
import ActionButton from "../ActionButton";
import TextInput from "../TextInput";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { CashLedger } from "../../models/cash_ledger";
import { useUser } from "../User/UserProvider";
import CashLedgerService from "../../services/CashLedgerService";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import CostInput from "../CostInput";
import { formatDate } from "../../utils/dateUtils";
import VisitList from "../Visit/VisitList";
import { CASH_VISITS_ATTRIBUTES } from "../../constants/list-headers";
import VisitService from "../../services/VisitService";
import { Visit } from "../../models/visit";
import CashLedgerPopup from "../Popups/CashLedgerPopup";
import { Action } from "../../models/action";
import {
  validateOpenCashLedgerForm,
  validateCashLedgerForm,
} from "../../utils/validators";
import CashLedgerManage from "../Popups/CashLedgerManage";
import { RoleType } from "../../models/login";

export function CashLedgerDashboard() {
  const { showAlert } = useAlert();
  const { user } = useUser();
  const [cashLedger, setCashLedger] = useState<CashLedger>({
    id: null,
    date: new Date().toISOString(),
    openingAmount: 0,
    deposit: 0,
    closingAmount: 0,
    cashOutAmount: 0,
    note: null,
  });
  const [baseOpeningAmount, setBaseOpeningAmount] = useState<number>(0);
  const baseOpeningAmountRef = useRef<number>(0);
  const [hasTodayLedger, setHasTodayLedger] = useState<boolean | null>(null);
  const [isOpeningFormVisible, setIsOpeningFormVisible] =
    useState<boolean>(false);
  const [showCostInput, setShowCostInput] = useState<boolean>(false);
  const [showClosingCostInput, setShowClosingCostInput] =
    useState<boolean>(false);
  const [showFillInfo, setShowFillInfo] = useState<boolean>(false);
  const [showCashOut, setShowCashOut] = useState<boolean>(false);
  const [showNote, setShowNote] = useState<boolean>(false);
  const [todayCashVisits, setTodayCashVisits] = useState<Visit[]>([]);
  const totalCashIncome = useMemo(
    () =>
      todayCashVisits
        .flatMap((v) => v.payments)
        .filter((p) => p.method === "CASH")
        .reduce((sum, p) => sum + p.amount, 0),
    [todayCashVisits],
  );
  const calculatedClosingAmount = useMemo(
    () => cashLedger.openingAmount + cashLedger.deposit + totalCashIncome - cashLedger.cashOutAmount,
    [cashLedger.openingAmount, cashLedger.cashOutAmount, totalCashIncome, cashLedger.deposit],
  );
  const closingDiscrepancy = useMemo(
    () =>
      Number(
        ((cashLedger.closingAmount ?? 0) - calculatedClosingAmount).toFixed(2),
      ),
    [cashLedger.closingAmount, calculatedClosingAmount],
  );
  const [isCashLedgerHistoryPopupOpen, setIsCashLedgerHistoryPopupOpen] =
    useState<boolean>(false);
  const [confirmLockPopupOpen, setConfirmLockPopupOpen] =
    useState<boolean>(false);

  const fetchLastClosingAmount = async () => {
    CashLedgerService.getLastClosingAmount()
      .then((amount) => {
        const base = Array.isArray(amount) ? 0 : amount;
        baseOpeningAmountRef.current = base;
        setBaseOpeningAmount(base);
        setShowFillInfo(!Array.isArray(amount));
        setCashLedger((prev) => ({ ...prev, openingAmount: base }));
      })
      .catch((error) => {
        showAlert("Błąd!", AlertType.ERROR);
        console.error("Error fetching last closingAmount.", error);
      });
  };
  const fetchTodayLedger = async () => {
    CashLedgerService.getTodayLedger()
      .then((data) => {
        if (Array.isArray(data)) {
          setHasTodayLedger(false);
          fetchLastClosingAmount();
        } else {
          setCashLedger({ ...data, closingAmount: data.closingAmount ?? 0 });
          setHasTodayLedger(true);
          if (!data.isClosed) {
            fetchCashPaymentVisits(data.date);
          }
        }
      })
      .catch((error) => {
        showAlert(
          "Błąd pobierania stanu dzisiejszej Kasetki.",
          AlertType.ERROR,
        );
        console.error("Error fetching today Leger.", error);
      });
  };
  const fetchCashPaymentVisits = async (date: string) => {
    VisitService.getVisitsWithCashPaymentByDate(date)
      .then((data) => {
        setTodayCashVisits(data);
        const income = data
          .flatMap((v) => v.payments)
          .filter((p) => p.method === "CASH")
          .reduce((sum, p) => sum + p.amount, 0);
        setCashLedger((prev) => ({
          ...prev,
          closingAmount: prev.openingAmount + prev.deposit + income - prev.cashOutAmount,
        }));
      })
      .catch((error) => {
        showAlert("Błąd pobierania Wizyt!", AlertType.ERROR);
        console.error("Error fetching Cash Payment Visits.", error);
      });
  };
  const fetchLastOpenCashLedger = async () => {
    CashLedgerService.getLastOpenCashLedger()
      .then((data) => {
        if (!Array.isArray(data) && data) {
          setCashLedger({ ...data, closingAmount: data.closingAmount ?? 0 });
          setHasTodayLedger(true);
          fetchCashPaymentVisits(data.date);
        } else {
          fetchTodayLedger();
        }
      })
      .catch(() => {
        fetchTodayLedger();
      });
  };

  useEffect(() => {
    fetchLastOpenCashLedger();
  }, []);
  useEffect(() => {
    console.log(cashLedger);
  }, [cashLedger]);

  /* OPENING NEW CASH LEDGER */
  const handleOpeningAmountChange = useCallback(
    (value: number) => {
      setCashLedger((prev) => ({
        ...prev,
        openingAmount: value,
      }));
    },
    [totalCashIncome],
  );
  const handleDepositChange = useCallback((value: number) => {
    setCashLedger((prev) => ({
      ...prev,
      deposit: value,
    }));
  }, []);
  const handleOpenLedger = async () => {
    const error = validateOpenCashLedgerForm(cashLedger);
    if (error) {
      showAlert(error, AlertType.ERROR);
      return null;
    }

    CashLedgerService.openCashLedger(cashLedger)
      .then(() => {
        showAlert("Kasetka została otwarta.", AlertType.SUCCESS);
        fetchCashPaymentVisits(cashLedger.date);
        setIsOpeningFormVisible(false);
        fetchTodayLedger();
      })
      .catch((error) => {
        showAlert("Błąd otwierania Kasetki.", AlertType.ERROR);
        console.error("Error opening CashLedger.", error);
      });
  };

  /* CASH LEDGER OPEN */
  const handleCashOutAmountChange = useCallback(
    (value: number) => {
      setCashLedger((prev) => ({
        ...prev,
        cashOutAmount: value,
        closingAmount: prev.openingAmount + prev.deposit + totalCashIncome - value,
      }));
    },
    [totalCashIncome],
  );
  const handleClosingAmountChange = useCallback((value: number) => {
    setCashLedger((prev) => ({ ...prev, closingAmount: value }));
  }, []);

  const handleCloseCashLedger = useCallback(async () => {
    if (cashLedger.id === null) return;
    const error = validateCashLedgerForm(cashLedger, null, Action.CREATE);
    if (error) {
      showAlert(error, AlertType.ERROR);
      return null;
    }
    CashLedgerService.closeCashLedger(cashLedger.id, cashLedger)
      .then((data) => {
        showAlert("Zamknięto Kasetkę!", AlertType.SUCCESS);
        setCashLedger({
          id: null,
          date: new Date().toISOString(),
          openingAmount: 0,
          deposit: 0,
          closingAmount: 0,
          cashOutAmount: 0,
          note: null,
        });
        fetchLastOpenCashLedger();
      })
      .catch((error) => {
        showAlert("Błąd zamykania Kasetki!", AlertType.ERROR);
        console.error("Error closing Cash Ledger.", error);
      });
  }, [cashLedger]);

  const isLedgerToday =
    cashLedger.date.slice(0, 10) === new Date().toISOString().slice(0, 10);

  const getLedgerStatus = (): {
    label: string;
    className: string;
    icon: string | null;
  } => {
    if (hasTodayLedger === null)
      return { label: "", className: "", icon: null };
    if (hasTodayLedger === false)
      return {
        label: "BRAK OTWARTEJ KASETKI NA DZISIAJ",
        className: "info",
        icon: null,
      };
    if (cashLedger.isClosed)
      return { label: "ZAMKNIĘTA", className: "closed", icon: "lock" };
    if (!isLedgerToday)
      return {
        label: "NIEZAMKNIĘTA KASETKA",
        className: "closed",
        icon: "warning",
      };
    return { label: "OTWARTA", className: "open", icon: "unlock" };
  };

  const renderContent = () => {
    if (hasTodayLedger === null) return null;

    if (!hasTodayLedger) {
      return (
        <div className="flex-column width-90 align-items-center justify-center g-25 align-self-center mt-5">
          <h2 className="cl-header">Brak otwartej kasetki na dzisiaj.</h2>
          <ActionButton
            src={"src/assets/unlock.svg"}
            alt={"Otwórz Kasetkę"}
            text={"Otwórz Kasetkę"}
            onClick={() => setIsOpeningFormVisible(true)}
            className={`cl ${isOpeningFormVisible ? "open" : ""}`}
          />
          {isOpeningFormVisible && (
            <section className="width-90 flex-column g-25 mt-2">
              <div className="flex g-4 align-items-center">
                <h2 className="cl-header">Stan początkowy kasetki:</h2>
                <div className="flex g-1 align-items-center">
                  <h2 className="cl-header amt italic">
                    {cashLedger.openingAmount.toFixed(2)} zł
                  </h2>
                  <ActionButton
                    src={"src/assets/edit.svg"}
                    alt={"Edytuj"}
                    disableText={true}
                    onClick={() => setShowCostInput((prev) => !prev)}
                    className="clear"
                  />
                  {showCostInput && (
                    <CostInput
                      selectedCost={baseOpeningAmount}
                      onChange={handleOpeningAmountChange}
                    />
                  )}
                  {showFillInfo && (
                    <span className="qv-span amt-info italic">
                      Wartość pobrana z ostatniej zamkniętej Kasetki.
                    </span>
                  )}
                </div>
              </div>
              <div className="flex g-4 align-items-center">
                <span className="span-cl">Depozyt:</span>
                <div className="flex g-1 align-items-center">
                  <CostInput
                    selectedCost={cashLedger.deposit}
                    onChange={handleDepositChange}
                    className="cash-ledger"
                  />
                  <span className="span-cl">zł</span>
                </div>
              </div>
              {cashLedger.deposit != 0 && (
                <div className="flex g-4 align-items-center">
                  <span className="span-cl">Razem:</span>
                  <div className="flex g-1 align-items-center">
                    <h2 className="cl-header amt green italic">
                      {(cashLedger.openingAmount + cashLedger.deposit).toFixed(
                        2,
                      )}{" "}
                      zł
                    </h2>
                  </div>
                </div>
              )}

              <ActionButton
                src={"src/assets/tick.svg"}
                alt={"Potwierdź"}
                text={"Potwierdź"}
                onClick={handleOpenLedger}
                className="open align-self-center"
              />
            </section>
          )}
        </div>
      );
    }

    if (cashLedger.isClosed) {
      return (
        <h2 className="cl-header mt-5 ">
          Kasetka z dzisiaj została zamknięta.
        </h2>
      );
    }

    return (
      <section className="width-90 flex-column">
        <div className="flex g-4 align-items-center mt-2 mb-2">
          <h2 className="cl-header">Stan początkowy kasetki:</h2>
          <h2 className="cl-header amt italic">
            {(cashLedger.openingAmount + cashLedger.deposit).toFixed(2)} zł
          </h2>
          {cashLedger.deposit > 0 && (
            <div className="flex g-5px">
              <span className="span-cl italic depo">w tym</span>
              <span className="span-cl italic depo amt">
                {cashLedger.deposit.toFixed(2)} zł
              </span>
              <span className="span-cl italic depo">depozytu.</span>
            </div>
          )}
        </div>
        <section className="flex width-max space-between align-items-center">
          <div className="flex-column today-visits width-45 justify-center">
            <h2 className="v-header mt-1 align-self-center">
              {!isLedgerToday
                ? `Płatności gotówką z dnia ${formatDate(cashLedger.date)}`
                : "Dzisiejsze płatności gotówką:"}
            </h2>
            <VisitList
              attributes={CASH_VISITS_ATTRIBUTES}
              visits={todayCashVisits}
              className="products cash-pm"
              disableExpand={true}
            />
            <div className="sb-month-summary mt-auto width-90 flex-column align-items-center align-self-center justify-center g-05">
              <div className="width-max flex space-between mt-1">
                <span className="qv-span visit-preview">Płatności razem:</span>

                <span className="qv-span visit-preview profit w">
                  + {totalCashIncome.toFixed(2)} zł
                </span>
              </div>
            </div>
          </div>
          <div className="flex-column today-visits width-45  align-items-center">
            <div className="flex g-4 align-items-center mt-2 mb-2">
              <h2 className="cl-header">Saldo:</h2>
              <h2 className="cl-header amt italic">
                {(cashLedger.openingAmount + cashLedger.deposit + totalCashIncome).toFixed(2)} zł
              </h2>
            </div>
            <div
              className={`flex width-fit-content align-self-start  ${showCashOut ? "g-2" : ""}`}
            >
              <ActionButton
                disableImg={true}
                text={"Wypłata"}
                onClick={() => {
                  setShowCashOut((prev) => !prev);
                  handleCashOutAmountChange(0);
                }}
                className={`cashout ${showCashOut ? "selected" : ""}`}
              />
              {showCashOut && (
                <div className="g-2 flex align-items-center">
                  <div className="flex g-10px align-items-center">
                    <CostInput
                      selectedCost={cashLedger.cashOutAmount}
                      onChange={handleCashOutAmountChange}
                      className="cash-ledger"
                    />
                    <span className="span-cl status">zł</span>
                  </div>
                </div>
              )}
            </div>
            <div className={`flex-column width-max align-self-start mt-2`}>
              <ActionButton
                src={"src/assets/addNew.svg"}
                alt={"Dodaj notatkę"}
                text={"Dodaj notatkę"}
                onClick={() => {
                  setShowNote((prev) => !prev);
                  setCashLedger((prev) => ({
                    ...prev,
                    note: null,
                  }));
                }}
                className={`cl-note ${showNote ? "selected" : ""}`}
              />
              {showNote && (
                <div className="mt-2 width-max">
                  <TextInput
                    placeholder="Notatka stanu kasetki..."
                    multiline={true}
                    rows={7}
                    onSelect={(value) =>
                      setCashLedger((prev) => ({
                        ...prev,
                        note: value as string,
                      }))
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex-column width-max align-items-center mt-auto">
              <div className="flex width-max g-1 align-items-center mb-2">
                <h2 className="cl-header">Saldo końcowe:</h2>
                <h2 className="cl-header amt final italic">
                  {(cashLedger.closingAmount ?? 0).toFixed(2)} zł
                </h2>
                <ActionButton
                  src={"src/assets/edit.svg"}
                  alt={"Edytuj"}
                  disableText={true}
                  onClick={() => {
                    setShowClosingCostInput((prev) => {
                      if (prev) {
                        setCashLedger((c) => ({
                          ...c,
                          closingAmount: calculatedClosingAmount,
                        }));
                      }
                      return !prev;
                    });
                  }}
                  className="clear"
                />
                {showClosingCostInput && (
                  <CostInput
                    selectedCost={cashLedger.closingAmount ?? 0}
                    onChange={handleClosingAmountChange}
                  />
                )}
              </div>
              <div className="flex width-max justify-end">
                <ActionButton
                  text={"Zatwierdź i zamknij"}
                  src={"src/assets/lock.svg"}
                  alt={"Zamknij Kasetkę"}
                  onClick={() => {
                    if (closingDiscrepancy !== 0 && !cashLedger.note) {
                      showAlert(
                        "Rozbieżność salda wymaga notatki.",
                        AlertType.ERROR,
                      );
                      setShowNote(true);
                      return;
                    }
                    setConfirmLockPopupOpen(true);
                  }}
                  className="lock"
                />
              </div>
            </div>
          </div>
        </section>
        {confirmLockPopupOpen && (
          <CashLedgerPopup
            onClose={() => setConfirmLockPopupOpen(false)}
            cashLedger={cashLedger}
            handleCloseCashLedger={handleCloseCashLedger}
          />
        )}
      </section>
    );
  };

  return (
    <div className="dashboard-panel width-85 height-max flex-column align-items-center">
      <NavigationBar showSearchbar={false} />
      <section className="products-action-buttons services-list width-90 flex align-self-center space-between g-25 mt-1 mb-1">
        <section className="flex g-2 align-items-center">
          <div className="flex g-10px align-items-center">
            <span className="span-cl status">Data:</span>
            <span
              className={`span-cl status date${isLedgerToday ? "" : " old"}`}
            >
              {formatDate(cashLedger.date)}
            </span>
          </div>
          <div className="flex g-10px align-items-center">
            <span className="span-cl status">Status:</span>

            <span className={`span-cl status ${getLedgerStatus().className}`}>
              {getLedgerStatus().label}
            </span>
            {getLedgerStatus().icon && (
              <img
                src={`src/assets/${getLedgerStatus().icon}.svg`}
                alt={"Status"}
                className="status-icon"
              />
            )}
          </div>
        </section>

        {user?.roles.includes(RoleType.ROLE_ADMIN) && (
          <ActionButton
            src={"src/assets/cl_history.svg"}
            alt={"Historia Kasetki"}
            text={"Historia Kasetki"}
            onClick={() => setIsCashLedgerHistoryPopupOpen(true)}
          />
        )}
      </section>
      {renderContent()}
      {isCashLedgerHistoryPopupOpen && (
        <CashLedgerManage
          onClose={() => setIsCashLedgerHistoryPopupOpen(false)}
        />
      )}
    </div>
  );
}

export default CashLedgerDashboard;
