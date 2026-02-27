import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import DropdownSelect from "../DropdownSelect";
import { Employee, EmployeeBonus } from "../../models/employee";
import { useState, useCallback, useEffect, useMemo } from "react";
import EmployeeService from "../../services/EmployeeService";
import ActionButton from "../ActionButton";
import { MONTHS, MONTH_LABELS_SHORT, getYears } from "../../utils/dateUtils";
import { EmployeeBonusFilterDTO } from "../../models/employee";
import StatisticsService from "../../services/StatisticsService";
import BonusHistoryVisitList from "./BonusHistoryVisitList";
import {
  BONUS_PRODUCT_LIST_ATTRIBUTES,
  BONUS_VISIT_HISTORY_ATTRIBUTES,
} from "../../constants/list-headers";
import UserService from "../../services/UserService";
import { User } from "../../models/login";
import ProductBonusList from "./ProductBonusList";
import StatSettingsService from "../../services/StatSettingsService";
import { StatSettings } from "../../models/business_settings";

const EmployeeBonusPage = () => {
  const [employeeBonus, setEmployeeBonus] = useState<EmployeeBonus | null>(
    null,
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filter, setFilter] = useState<EmployeeBonusFilterDTO>({
    employeeId: null,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const { showAlert } = useAlert();
  const years = useMemo(() => getYears(), []);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [user, setUser] = useState<User | null>(null);
  const [statSettings, setStatSettings] = useState<StatSettings | null>(null);

  const disabledMonthIds = useMemo(() => {
    if (filter.year !== currentYear) return [];
    return MONTHS.filter((m) => m.id > currentMonth).map((m) => m.id);
  }, [filter.year, currentYear, currentMonth]);

  const fetchEmployees = async () => {
    EmployeeService.getAllEmployees()
      .then((data) => {
        setEmployees(data);
      })
      .catch((error) => {
        console.error("Error fetching Employees: ", error);
        showAlert("Błąd", AlertType.ERROR);
        setEmployees([]);
      });
  };
  const fetchUser = useCallback(async () => {
    if (filter.employeeId) {
      UserService.getUserByEmployeeId(filter.employeeId)
        .then((data) => {
          setUser(data);
        })
        .catch((error) => {
          setUser(null);
          showAlert("Błąd", AlertType.ERROR);
          console.error("Failed to fetch User by employeeId.", error);
        });
    }
  }, [filter]);
  const fetchEmployeeBonus = useCallback(async () => {
    if (!filter.employeeId) return;
    StatisticsService.getEmployeeBonus(filter)
      .then((data) => {
        setEmployeeBonus(data);
      })
      .catch((error) => {
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching Employee Bonus: ", error);
      });
  }, [filter]);

  const handleEmployeeChange = useCallback(
    (employee: Employee | Employee[] | null) => {
      const selected = Array.isArray(employee) ? employee[0] : employee;
      setFilter((prev) => ({
        ...prev,
        employeeId: selected?.id ?? prev.employeeId,
      }));
    },
    [],
  );
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
        month: month ?? prevFilter.month,
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
        year: year ?? prevFilter.year,
      }));
    },
    [],
  );
  const handleResetFiltersAndData = useCallback(() => {
    const now = new Date();
    setFilter({
      employeeId: employees.length > 0 ? employees[0].id : null,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
  }, [employees]);

  const quarterData = useMemo(() => {
    const payoutMonths = statSettings?.saleBonusPayoutMonths;
    if (!payoutMonths || payoutMonths.length === 0 || !filter.month)
      return null;
    const sorted = [...payoutMonths].sort((a, b) => a - b);
    const nextPayout = sorted.find((m) => m >= filter.month!) ?? sorted[0];
    const monthsUntil = (nextPayout - filter.month! + 12) % 12;
    const filledCount = 3 - monthsUntil;
    const qMonths = [nextPayout - 2, nextPayout - 1, nextPayout].map((m) =>
      m <= 0 ? m + 12 : m,
    );
    return { qMonths, filledCount };
  }, [statSettings, filter.month]);

  useEffect(() => {
    fetchEmployees();
    StatSettingsService.getSettings()
      .then(setStatSettings)
      .catch(() => console.error("Failed to fetch StatSettings"));
  }, []);
  useEffect(() => {
    fetchUser();
  }, [employeeBonus]);
  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      employeeId: employees.length > 0 ? employees[0].id : null,
    }));
  }, [employees]);
  useEffect(() => {
    fetchEmployeeBonus();
  }, [filter]);
  return (
    <>
      <section className="flex width-90 align-items-center g-4 mt-15 mb-15">
        <div className="flex align-items-center g-10px">
          <a className="product-form-input-title">Pracownik:</a>
          <DropdownSelect<Employee>
            items={employees}
            onChange={handleEmployeeChange}
            value={
              filter.employeeId
                ? (employees.find((e) => e.id === filter.employeeId) ?? null)
                : null
            }
            placeholder="Nie wybrano"
            searchable={false}
            multiple={false}
            allowNew={false}
            className="visit-list"
          />
        </div>
        <div className="flex align-items-center g-10px">
          <a className="product-form-input-title">Rok:</a>
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
        </div>
        <div className="flex align-items-center g-10px">
          <a className="product-form-input-title">Miesiąc:</a>
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
        </div>

        <ActionButton
          src={"src/assets/reset.svg"}
          alt={"Reset"}
          iconTitle={"Resetuj filtry"}
          text={"Reset"}
          onClick={handleResetFiltersAndData}
          disableText={true}
        />
      </section>

      <section className="flex-column width-95 align-items-center">
        <div className="flex width-max align-items-center g-1 justify-center mb-1">
          <div className="profile-avatar sb-rev flex align-items-center justify-center">
            <img
              src={`src/assets/avatars/${user?.avatar}`}
              alt="Avatar"
              className="user-pfp sb-rev"
            ></img>
          </div>
          <span className="qv-span emp sb-rev">
            {employees.find((e) => e.id === filter.employeeId)?.name}
          </span>
        </div>
        <section className="flex width-max align-items-center space-between">
          <section className="services-bonus width-45 flex-column">
            <div className="sb-content width-max flex-column align-items-center space-between height-fit-content ">
              <BonusHistoryVisitList
                visits={employeeBonus?.visits ?? []}
                attributes={BONUS_VISIT_HISTORY_ATTRIBUTES}
                month={filter.month!}
                year={filter.year!}
                className="sb-rev"
              />
              <div className="sb-month-summary mt-05 width-90 flex-column align-items-center justify-center g-05">
                <div className="width-max flex space-between mt-05">
                  <span className="qv-span visit-preview">Przychód:</span>

                  <span className="qv-span visit-preview profit w">
                    + {employeeBonus?.monthlyServicesRevenue} zł
                  </span>
                </div>
                {employeeBonus && employeeBonus.boostCost > 0 && (
                  <div className="width-max flex space-between">
                    <div className="flex g-5px align-items-center">
                      <img
                        src="src/assets/boost.svg"
                        alt="Boost"
                        className="visit-form-icon"
                      ></img>

                      <span className="qv-span visit-preview">
                        Koszt Boost:
                      </span>
                    </div>
                    <span className="qv-span visit-preview sb-threshold">
                      - {employeeBonus?.boostCost} zł
                    </span>
                  </div>
                )}
                <div className="width-max flex space-between">
                  <span className="qv-span visit-preview">Próg:</span>

                  <span className="qv-span visit-preview sb-threshold">
                    - {employeeBonus?.bonusThreshold} zł
                  </span>
                </div>
                <div className="width-max flex space-between">
                  <span className="qv-span visit-preview">Procent:</span>

                  <span className="qv-span visit-preview sb-percent">
                    {employeeBonus?.bonusPercent} %
                  </span>
                </div>
                <div className="sb-title flex align-items-center g-1 align-self-center">
                  <h2 className="sb-header">Premia utarg:</h2>
                  <h2 className="sb-header bonus-value">
                    {"+ " + employeeBonus?.bonusAmount + " zł"}
                  </h2>
                </div>
              </div>
            </div>
          </section>
          <section className="services-bonus width-45 flex-column">
            <div className="sb-content width-max flex-column align-items-center space-between height-fit-content ">
              <ProductBonusList
                items={employeeBonus?.products ?? []}
                attributes={BONUS_PRODUCT_LIST_ATTRIBUTES}
                className="sb-rev prod"
              />
              <div className="sb-month-summary mt-05 width-90 flex-column align-items-center justify-center g-05">
                <div className="width-max flex space-between mt-05">
                  <span className="qv-span visit-preview">
                    Przychód ze sprzedaży:
                  </span>

                  <span className="qv-span visit-preview profit w">
                    + {employeeBonus?.monthlyProductsRevenue} zł
                  </span>
                </div>
                <div className="width-max flex space-between">
                  <span className="qv-span visit-preview">Premia suma:</span>

                  <span className="qv-span visit-preview profit w">
                    + {employeeBonus?.productBonusAmount} zł
                  </span>
                </div>
                <div className="width-max flex space-between">
                  <span className="qv-span visit-preview">Procent:</span>

                  <span className="qv-span visit-preview sb-percent">
                    {employeeBonus?.saleBonusPercent} %
                  </span>
                </div>
                {quarterData && (
                  <div className="sb-quarter-bar flex width-max mt-025 g-5px mb-05">
                    {quarterData.qMonths.map((month, i) => {
                      const distBack = quarterData.filledCount - 1 - i;
                      const value =
                        i < quarterData.filledCount
                          ? distBack === 0
                            ? employeeBonus?.productBonusAmount
                            : distBack === 1
                              ? employeeBonus?.prevMonthSaleBonus
                              : employeeBonus?.twoMonthPrevSaleBonus
                          : null;
                      return (
                        <div
                          key={i}
                          className="sb-quarter-col flex-column align-items-center g-5px f-1"
                        >
                          <span className="sb-quarter-label">
                            {MONTH_LABELS_SHORT[month - 1]}
                          </span>
                          <div
                            className={`sb-quarter-segment width-max flex align-items-center justify-center${i < quarterData.filledCount ? " filled" : ""}${i === 2 ? " payout" : ""}`}
                          >
                            {value != null ? `${value} zł` : "-"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="sb-title flex align-items-center g-1 align-self-center">
                  <h2 className="sb-header">Premia produktowa:</h2>
                  <h2
                    className={`sb-header prod-bonus-value ${quarterData?.filledCount !== 3 ? "not-payout-month" : ""}`}
                  >
                    {"+ " +
                      ((employeeBonus?.productBonusAmount ?? 0) +
                        (employeeBonus?.prevMonthSaleBonus ?? 0) +
                        (employeeBonus?.twoMonthPrevSaleBonus ?? 0)) +
                      " zł"}
                  </h2>
                </div>
              </div>
            </div>
          </section>
        </section>
      </section>
    </>
  );
};

export default EmployeeBonusPage;
