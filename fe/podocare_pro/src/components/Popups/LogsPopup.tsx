import { useEffect, useState, useCallback } from "react";
import { useAlert } from "../Alert/AlertProvider";
import ActionButton from "../ActionButton";
import ReactDOM from "react-dom";
import ListHeader from "../ListHeader";
import { AUDIT_LOG_LIST_ATTRIBUTES } from "../../constants/list-headers";
import { AlertType } from "../../models/alert";
import SearchBar from "../SearchBar";
import { AuditAction, AuditLog, AuditLogFilterDTO } from "../../models/audit_log";
import AuditLogService from "../../services/AuditLogService";
import LogsList from "../Business/LogsList";
import DropdownSelect from "../DropdownSelect";
import { User } from "../../models/login";
import UserService from "../../services/UserService";
import DateInput from "../DateInput";

export interface LogsPopupProps {
  onClose: () => void;
  className?: string;
}

export function LogsPopup({
  onClose,
  className = "",
}: LogsPopupProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<AuditLogFilterDTO>({
        entityType:  null,
        keyword: "",
        action :  null,
        performedBy:  null,
        dateFrom:  null,
        dateTo:  null,
    });
  const [resetTriggered, setResetTriggered] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const { showAlert } = useAlert();

  const fetchLogs = async (pageNum: number = 0, append: boolean = false): Promise<void> => {
    setLoading(true);
    AuditLogService.getAuditLogs(filter, pageNum)
      .then((data) => {
        if (append) {
          setLogs((prev) => [...prev, ...data.content]);
        } else {
          setLogs(data.content);
        }
        setPage(pageNum);
        setHasMore(!data.last);
      })
      .catch((error) => {
        setLogs([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching Logs: ", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchUsers = async (): Promise<void> => {
    UserService.getAllUsers()
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        setUsers([]);
        console.error("Error fetching Users: ", error);
      });
  };

  const handleUserSelect = useCallback((value: User | User[] | null) => {
    const user = Array.isArray(value) ? value[0] : value;
    setSelectedUser(user);
    setFilter((prev) => ({
      ...prev,
      performedBy: user ? user.username : null,
    }));
  }, []);

  const handleKeywordChange = useCallback((newKeyword: string) => {
    setFilter((prev) => ({
      ...prev,
      keyword: newKeyword,
    }));
  }, []);

  const handleDateFromChange = useCallback((date: string | null) => {
    if (date && filter.dateTo && date > filter.dateTo) {
      showAlert("Data 'Od' nie może być późniejsza niż data 'Do'!", AlertType.ERROR);
      return;
    }
    setFilter((prev) => ({
      ...prev,
      dateFrom: date,
    }));
  }, [filter.dateTo, showAlert]);

  const handleDateToChange = useCallback((date: string | null) => {
    if (date && filter.dateFrom && date < filter.dateFrom) {
      showAlert("Data 'Do' nie może być wcześniejsza niż data 'Od'!", AlertType.ERROR);
      return;
    }
    setFilter((prev) => ({
      ...prev,
      dateTo: date,
    }));
  }, [filter.dateFrom, showAlert]);

  const toggleAction = () => {
    setFilter((prev) => {
      let nextAction: AuditAction | null = null;

      if (prev.action === null) nextAction = AuditAction.CREATE;
      else if (prev.action === AuditAction.CREATE) nextAction = AuditAction.UPDATE;
      else if (prev.action === AuditAction.UPDATE) nextAction = AuditAction.DELETE;
      else nextAction = null;

      return { ...prev, action: nextAction };
    });
  };

  const handleResetFilters = useCallback(() => {
    setFilter({
      entityType: null,
      keyword: "",
      action: null,
      performedBy: null,
      dateFrom: null,
      dateTo: null,
    });
    setResetTriggered((prev) => !prev)
    setSelectedUser(null);
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const scrolledToBottom = 
          target.scrollHeight - target.scrollTop <= target.clientHeight + 100; // 100px b4 end of the list
    
        if (scrolledToBottom && hasMore && !loading) {
          fetchLogs(page + 1, true);
        }
      }, [hasMore, loading, page, filter]);

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
        className="logs-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-1">
          <h2 className="popup-title">🕵🏻‍♀️ Historia zmian </h2>
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
        <section className="flex width-90 space-between mb-1 g-2">
          <ActionButton
            src={"src/assets/filter_icon.svg"}
            alt={"Akcja"}
            text={`Akcja: ${filter.action ?? "WSZYSTKIE"}`}
            onClick={toggleAction}
            className={`audit-action-filter ${
              filter.action === null
                ? "wszystkie"
                : filter.action === AuditAction.CREATE
                ? "create"
                : filter.action === AuditAction.UPDATE
                ? "update"
                : "delete"
            }`}
          />
          <DropdownSelect<User>
            items={users}
            onChange={handleUserSelect}
            value={selectedUser}
            getItemLabel={(u) => u.username}
            placeholder="Użytkownik"
            searchable={false}
            multiple={false}
            allowNew={false}
          />
          <SearchBar
            onKeywordChange={handleKeywordChange}
            resetTriggered={resetTriggered}
          />
          <div className="flex align-items-center g-05">
            <span>Od:</span>
            <DateInput
              onChange={handleDateFromChange}
              selectedDate={filter.dateFrom}
            />
          </div>
          <div className="flex align-items-center g-05">
            <span>Do:</span>
            <DateInput
              onChange={handleDateToChange}
              selectedDate={filter.dateTo}
            />
          </div>
          
          <ActionButton
            src={"src/assets/reset.svg"}
            alt={"Reset"}
            iconTitle={"Resetuj filtry"}
            text={"Reset"}
            onClick={handleResetFilters}
            disableText={true}
          />
        </section>
        <ListHeader attributes={AUDIT_LOG_LIST_ATTRIBUTES} />
        <LogsList
        attributes={AUDIT_LOG_LIST_ATTRIBUTES} 
        logs={logs}
         onScroll={handleScroll}
        isLoading={loading}
        hasMore={hasMore}
        className="products logs"
        />
      </div>
    </div>,
    portalRoot
  );
}

export default LogsPopup;
