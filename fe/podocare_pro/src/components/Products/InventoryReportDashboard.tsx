import React from "react";
import { useState, useCallback, useEffect, useMemo } from "react";
import ActionButton from "../ActionButton";
import { useAlert } from "../Alert/AlertProvider";
import ProductReportPopup from "../Popups/ProductReportPopup";
import StockAdjustmentReportPopup from "../Popups/StockAdjustmentReportPopup";
import ModulesNavigationBar from "../Orders/ModulesNavigationBar";
import {
  WAREHOUSE_SUBMENU_ITEMS,
  SubModuleType,
} from "../../constants/modules";
import InventoryReportService from "../../services/InventoryReportService";
import {
  InventoryReport,
  InventoryReportFilterDTO,
} from "../../models/inventory_report";
import { AlertType } from "../../models/alert";
import InventoryReportList from "./InventoryReportList";
import { INVENTORY_REPORTS_LIST_ATTRIBUTES } from "../../constants/list-headers";
import ListHeader from "../ListHeader";
import { getYears, MONTHS } from "../../utils/dateUtils";
import DropdownSelect from "../DropdownSelect";
import { Employee } from "../../models/employee";
import EmployeeService from "../../services/EmployeeService";

export interface InventoryReportDashboardProps {
  setModuleVisible: (module: SubModuleType) => void;
  activeModule: SubModuleType;
}

export function InventoryReportDashboard({
  setModuleVisible,
  activeModule,
}: InventoryReportDashboardProps) {
  const [isCurrentInventoryPopupOpen, setIsCurrentInventoryPopupOpen] =
    useState<boolean>(false);
  const [isProductReportPopupOpen, setIsProductReportPopupOpen] =
    useState<boolean>(false);
  const [inventoryReports, setInventoryReports] = useState<InventoryReport[]>(
    [],
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filter, setFilter] = useState<InventoryReportFilterDTO>({
    employeeId: null,
    year: new Date().getFullYear(),
    month: null,
  });
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const years = useMemo(() => getYears(), []);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const { showAlert } = useAlert();

  const disabledMonthIds = useMemo(() => {
    if (filter.year !== currentYear) return [];
    return MONTHS.filter((m) => m.id > currentMonth).map((m) => m.id);
  }, [filter.year, currentYear, currentMonth]);

  const fetchInventoryReports = useCallback(
    async (pageNum: number = 0, append: boolean = false) => {
      setLoading(true);
      InventoryReportService.getInventoryReports(filter, pageNum, 30)
        .then((data) => {
          const content = data?.content || [];
          if (append) {
            setInventoryReports((prev) => [...prev, ...content]);
          } else {
            setInventoryReports(content);
          }

          setHasMore(!data.last);
          setPage(pageNum);
          setLoading(false);
        })
        .catch((error) => {
          if (!append) setInventoryReports([]);
          setLoading(false);
          showAlert("Błąd", AlertType.ERROR);
          console.error("Error fetching categories:", error);
        });
    },
    [filter],
  );
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

  const handleEmployeeChange = useCallback(
      (employee: Employee | Employee[] | null) => {
        const selected = Array.isArray(employee) ? employee[0] : employee;
        setFilter((prev) => ({
          ...prev,
          employeeId: selected?.id ?? null,
        }));
      },
      []
    );
  const handleYearChange = useCallback(
    (
      selected:
        | { id: number; name: string }
        | { id: number; name: string }[]
        | null,
    ) => {
      const year = Array.isArray(selected) ? selected[0]?.id : selected?.id;
      setFilter((prev) => {
        let newMonth = prev.month;
        if (year === currentYear && prev.month && prev.month > currentMonth) {
          newMonth = currentMonth;
        }
        return {
          ...prev,
          year: year ?? prev.year,
          month: newMonth,
        };
      });
    },
    [currentYear, currentMonth],
  );
  const handleMonthChange = useCallback(
    (
      selected:
        | { id: number; name: string }
        | { id: number; name: string }[]
        | null,
    ) => {
      const month = Array.isArray(selected) ? selected[0]?.id : selected?.id;
      setFilter((prev) => ({
        ...prev,
        month: month ?? null,
      }));
    },
    [],
  );

  useEffect(() => {
    fetchEmployees();
    fetchInventoryReports(0, false);
    setPage(0);
    setHasMore(true);
  }, [filter]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrolledToBottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 100; // 100px b4 end of the list

      if (scrolledToBottom && hasMore && !loading) {
        fetchInventoryReports(page + 1, true);
      }
    },
    [hasMore, loading, page, filter],
  );

  return (
    <div className="dashboard-panel width-85 height-max flex-column align-items-center">
      <ModulesNavigationBar
        setModuleVisible={setModuleVisible}
        submenuItems={WAREHOUSE_SUBMENU_ITEMS}
        activeModule={activeModule}
      />

      <section className="products-action-buttons width-90 flex align-self-center space-between mt-1 mb-1">
        <div className="flex g-25">
          <div className="flex g-1 align-items-center">
            <a className="product-form-input-title">Pracownik:</a>
            <DropdownSelect<Employee>
              items={employees}
              onChange={handleEmployeeChange}
              value={
                filter.employeeId
                  ? employees.find((e) => e.id === filter.employeeId) ?? null
                  : null
              }
              placeholder="Nie wybrano"
              searchable={false}
              multiple={false}
              allowNew={false}
              className="visit-list"
            />
          </div>
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
            placeholder="Rok"
            className="expense-year"
          />

          <DropdownSelect
            divided={true}
            items={MONTHS}
            value={
              filter.month
                ? (MONTHS.find((m) => m.id === filter.month) ?? null)
                : null
            }
            onChange={handleMonthChange}
            searchable={false}
            allowNew={false}
            placeholder="Miesiąc"
            className="expense-month"
            disabledItemIds={disabledMonthIds}
          />
        </div>
        <div className="flex g-25 justify-end">
          <ActionButton
            src={"src/assets/pdf.svg"}
            alt={"Wygeneruj PDF"}
            text={"Wygeneruj PDF Stanu Magazynowego"}
            onClick={() => setIsCurrentInventoryPopupOpen(true)}
          />
          <ActionButton
            src={"src/assets/report.svg"}
            alt={"Raport Stanu Mag."}
            text={"Utwórz Raport"}
            onClick={() => setIsProductReportPopupOpen(true)}
          />
        </div>
      </section>
      <ListHeader attributes={INVENTORY_REPORTS_LIST_ATTRIBUTES} />
      <InventoryReportList
        inventoryReports={inventoryReports}
        attributes={INVENTORY_REPORTS_LIST_ATTRIBUTES}
        onScroll={handleScroll}
        onSuccess={() => fetchInventoryReports(0, false)}
        className="services inv-rep"
      />
      {isCurrentInventoryPopupOpen && (
        <ProductReportPopup
          onClose={() => setIsCurrentInventoryPopupOpen(false)}
        />
      )}
      {isProductReportPopupOpen && (
        <StockAdjustmentReportPopup
          onClose={() => setIsProductReportPopupOpen(false)}
          onSuccess={() => fetchInventoryReports(0, false)}
        />
      )}
    </div>
  );
}

export default InventoryReportDashboard;
