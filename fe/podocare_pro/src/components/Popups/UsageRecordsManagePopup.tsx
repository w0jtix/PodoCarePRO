import { useEffect, useState, useCallback } from "react";
import { useAlert } from "../Alert/AlertProvider";
import ActionButton from "../ActionButton";
import ReactDOM from "react-dom";
import RemovePopup from "./RemovePopup";
import { AlertType } from "../../models/alert";
import ReviewService from "../../services/ReviewService";
import { USAGE_RECORDS_LIST_ATTRIBUTES } from "../../constants/list-headers";
import { getUsageReasonDisplay, UsageRecord, UsageRecordFilterDTO } from "../../models/usage-record";
import UsageRecordService from "../../services/UsageRecordService";
import UsageRecordsList from "../Products/UsageRecordsList";
import UsageRecordPopup from "./UsageRecordPopup";
import SearchBar from "../SearchBar";
import DateInput from "../DateInput";
import DropdownSelect from "../DropdownSelect";
import { Employee } from "../../models/employee";
import EmployeeService from "../../services/EmployeeService";
import { UsageReason } from "../../models/usage-record";

export interface UsageRecordsManagePopupProps {
  onClose: () => void;
  className?: string;
}

export function UsageRecordsManagePopup({
  onClose,
  className = "",
}: UsageRecordsManagePopupProps) {
  const [isAddNewUsageRecordPopupOpen, setIsAddNewUsageRecordPopupOpen] =
    useState<boolean>(false);
  const [removeUsageRecordId, setRemoveUsageRecordId] = useState<number | null>(
    null
  );
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[] | null>(null);
  const [filter, setFilter] = useState<UsageRecordFilterDTO>({
    keyword: "",
    employeeIds: null,
    usageReason: null,
    startDate: null,
    endDate: null,
  });
  const [resetTriggered, setResetTriggered] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const { showAlert } = useAlert();

  const fetchUsageRecords = async (
    pageNum: number = 0,
    append: boolean = false
  ): Promise<void> => {
    setLoading(true);
    UsageRecordService.getUsageRecords(filter, pageNum, 30)
      .then((data) => {
        const content = data?.content || [];
        if (append) {
          setUsageRecords((prev) => [...prev, ...content]);
        } else {
          setUsageRecords(content);
        }

        setHasMore(!data.last);
        setPage(pageNum);
      })
      .catch((error) => {
        if (!append) setUsageRecords([]);
        setHasMore(false);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching UsageRecords: ", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
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

  /* FILTERS */

  const handleKeywordChange = useCallback(
    (newKeyword: string) => {
      setFilter((prev) => ({
        ...prev,
        keyword: newKeyword,
      }));
    },
    []
  );
  const toggleStatus = () => {
      setFilter((prev) => {
      let nextStatus: UsageReason | null = null;
  
      if (prev.usageReason === null) nextStatus = UsageReason.REGULAR_USAGE;
      else if (prev.usageReason === UsageReason.REGULAR_USAGE) nextStatus = UsageReason.OUT_OF_DATE;
      else nextStatus = null;
  
      return { ...prev, usageReason: nextStatus };
    });
    };
  const handleUsageRecordRemove = useCallback(async (): Promise<void> => {
    try {
      if (removeUsageRecordId) {
        await UsageRecordService.deleteUsageRecord(removeUsageRecordId);
        showAlert("Pomyślnie usunięto Zużycie Produktu!", AlertType.SUCCESS);
        setRemoveUsageRecordId(null);
        fetchUsageRecords();
      }
    } catch (error) {
      showAlert("Błąd usuwania Zużycia Produktu!", AlertType.ERROR);
    }
  }, [removeUsageRecordId]);
  const handleDateFromChange = useCallback(
    (newDateString: string | null) => {
      setFilter((prevFilter) => {
        if (newDateString && prevFilter.endDate) {
          if (newDateString > prevFilter.endDate) {
            showAlert(
              "Błędne daty:  Data od późniejsza niż Data do!",
              AlertType.ERROR
            );
            return prevFilter;
          }
        }
        return { ...prevFilter, startDate: newDateString };
      });
    },
    [showAlert]
  );
  const handleDateToChange = useCallback(
    (newDateString: string | null) => {
      setFilter((prevFilter) => {
        if (newDateString && prevFilter.startDate) {
          if (newDateString < prevFilter.startDate) {
            showAlert(
              "Błędne daty: Data do wcześniejsza niż Data od!",
              AlertType.ERROR
            );
            return prevFilter;
          }
        }
        return { ...prevFilter, endDate: newDateString };
      });
    },
    [showAlert]
  );
  const handleEmployeeChange = useCallback(
      (employees: Employee | Employee[] | null) => {
        if (employees) {
          const selectedEmployees = Array.isArray(employees)
            ? employees
            : [employees];
  
          const employeeIds = selectedEmployees.map((employee) => employee.id);
  
          setFilter((prev) => ({
            ...prev,
            employeeIds: employeeIds.length > 0 ? employeeIds : null,
          }));
          setSelectedEmployees(
            selectedEmployees.length > 0 ? selectedEmployees : null
          );
        } else {
          setFilter((prev) => ({
            ...prev,
            employeeIds: null,
          }));
          setSelectedEmployees(null);
        }
      },
      []
    );
    const handleResetFiltersAndData = useCallback(() => {
        setFilter({
          keyword: "",
    employeeIds: null,
    usageReason: null,
    startDate: null,
    endDate: null,
        });
        setSelectedEmployees([]);
        setResetTriggered((prev) => !prev);
        setPage(0);
        setHasMore(true);
      }, []);

  useEffect(() => {
    fetchUsageRecords();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchUsageRecords();
  }, [filter]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrolledToBottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 100; // 100px b4 end of the list

      if (scrolledToBottom && hasMore && !loading) {
        fetchUsageRecords(page + 1, true);
      }
    },
    [hasMore, loading, page, filter]
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
      onClick={onClose}
    >
      <div
        className="manage-usage-records-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-1">
          <h2 className="popup-title">Zarządzaj Zużyciem Produktów</h2>
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
        <section className="flex width-90 justify-end mb-1 g-2">
          <ActionButton
            src={"src/assets/addNew.svg"}
            alt={"Nowe Zużycie Produktu"}
            text={"Nowe Zużycie Produktu"}
            onClick={() => setIsAddNewUsageRecordPopupOpen(true)}
          />
        </section>
        <section className="flex-column width-90 space-between mb-1 g-2">
          <div className="flex width-max align-items-center space-between">
            <ActionButton
                        src={"src/assets/filter_icon.svg"}
                        alt={"Powód"}
                        text={`Powód: ${filter.usageReason === null ? "wszystkie" : filter.usageReason && getUsageReasonDisplay(filter.usageReason).toLowerCase()}`}
                        onClick={toggleStatus}
                        className={`usage-reason ${filter.usageReason === null ? "" : filter.usageReason === UsageReason.OUT_OF_DATE ? "date" : "usage"}`}
                      />
            <SearchBar onKeywordChange={handleKeywordChange} resetTriggered={resetTriggered}/>
            <ActionButton
                      src={"src/assets/reset.svg"}
                      alt={"Reset"}
                      iconTitle={"Resetuj filtry"}
                      text={"Reset"}
                      onClick={handleResetFiltersAndData}
                      disableText={true}
                    />
          </div>
          <div className="flex width-max align-items-center space-around">
            
                <div className="popup-common-section-row flex align-items-center space-between g-10px name">
              <a className="product-form-input-title">Pracownik:</a>
              <DropdownSelect<Employee>
                items={employees}
                onChange={handleEmployeeChange}
                value={selectedEmployees}
                placeholder="Nie wybrano"
                searchable={false}
                multiple={true}
                allowNew={false}
                className="visit-list"
              />
            </div>      
            <section className="usage-record-date-filter flex g-15px">
              <a className="order-history-action-buttons-a align-center">
                Data od:
              </a>
              <DateInput
                onChange={handleDateFromChange}
                selectedDate={filter.startDate || null}
                showPlaceholder={true}
              />
            </section>
            <section className="usage-record-date-filter flex g-15px">
              <a className="order-history-action-buttons-a align-center">
                Data do:
              </a>
              <DateInput
                onChange={handleDateToChange}
                selectedDate={filter.endDate || null}
                showPlaceholder={true}
              />
            </section>
            
          </div>
        </section>
        <UsageRecordsList
          attributes={USAGE_RECORDS_LIST_ATTRIBUTES}
          items={usageRecords}
          setRemoveUsageRecordId={setRemoveUsageRecordId}
          setIsAddNewUsageRecordPopupOpen={setIsAddNewUsageRecordPopupOpen}
          onScroll={handleScroll}
          isLoading={loading}
          hasMore={hasMore}
          className={"products usage"}
        />
      </div>
      {isAddNewUsageRecordPopupOpen && (
        <UsageRecordPopup
          onClose={() => {
            setIsAddNewUsageRecordPopupOpen(false);
            handleResetFiltersAndData();
          }}
        />
      )}
      {removeUsageRecordId != null && (
        <RemovePopup
          onClose={() => {
            setRemoveUsageRecordId(null);
          }}
          className=""
          handleRemove={handleUsageRecordRemove}
          warningText={
            "Zatwierdzenie spowoduje usunięcie Opinii z bazy danych!"
          }
        />
      )}
    </div>,
    portalRoot
  );
}

export default UsageRecordsManagePopup;
