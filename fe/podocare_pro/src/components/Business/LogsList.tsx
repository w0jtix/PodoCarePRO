import React from "react";
import { useState } from "react";
import { ListAttribute } from "../../constants/list-headers";
import { formatTimestamp } from "../../utils/dateUtils";
import { AuditAction, AuditLog } from "../../models/audit_log";
import LogContent from "./LogContent";
import arrowDownIcon from "../../assets/arrow_down.svg";
import addNewIcon from "../../assets/addNew.svg";
import editIcon from "../../assets/edit.svg";
import cancelIcon from "../../assets/cancel.svg";
import loginIcon from "../../assets/login.svg";

const actionIconMap: Record<AuditAction, string> = {
  [AuditAction.CREATE]: addNewIcon,
  [AuditAction.UPDATE]: editIcon,
  [AuditAction.DELETE]: cancelIcon,
};

const getActionIcon = (log: AuditLog): string => {
  if (log.action === AuditAction.CREATE && log.entityType === "User-Login") {
    return loginIcon;
  }
  return actionIconMap[log.action];
};

export interface LogsListProps {
  attributes: ListAttribute[];
  logs: AuditLog[];
  className?: string;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  handleResetFiltersAndData?: () => void;
}

export function LogsList({
  attributes,
  logs = [],
  className = "",
  onScroll,
  isLoading = false,
}: LogsListProps) {
  const [expandedLogsIds, setExpandedLogsIds] = useState<number[]>([]);
  

  const toggleLogs = (logId: number) => {
    setExpandedLogsIds((prevIds) =>
      prevIds.includes(logId)
        ? prevIds.filter((id) => id !== logId)
        : [...prevIds, logId]
    );
  };

  const renderAttributeContent = (
    attr: ListAttribute,
    log: AuditLog
  ): React.ReactNode => {
    switch (attr.name) {
      case "":
        return (
          <img
            src={arrowDownIcon}
            alt="arrow down"
            className={`arrow-down ${
              expandedLogsIds.includes(log.id) ? "rotated" : ""
            }`}
          />
        );

        case " ":
        return (
          <img
            src={getActionIcon(log)}
            alt="action icon"
            className={`visit-form-icon ${getActionIcon(log)} ml-05`}
          />
        );

      case "Użytkownik":
        return (
          <span className="order-values-lower-font-size ml-1">
            {log.performedBy}
          </span>
        );

      case "Data":
        return (
          <span className="order-values-lower-font-size">
            {formatTimestamp(log.timestamp)}
          </span>
        );

      
      case "Obiekt":
        return (
          <span className="order-values-lower-font-size">
            {log.entityType}
          </span>
        );

      case "ID":
        return (
          <span className="order-values-lower-font-size ml-05 logs">
             {log.entityId} 
          </span>
        );

      case "   ":
        return (
          <span className="order-values-lower-font-size entity-key-trait">
            {log.entityKeyTrait === null ? "" : log.entityKeyTrait}
          </span>
        );

      case "Zmiana":
        return (
          <span
            className={`order-values-lower-font-size fields-changed`}
          >
            {log.changedFields}
          </span>
        );

        case "IP":
        return (
          <span className="order-values-lower-font-size ml-05">
             {log.ipAddress} 
          </span>
        );
      

      default:
        return <span>{"-"}</span>;
    }
  };

  return (
    <div
      className={`item-list order width-93 flex-column p-0 mt-05 ${
        logs.length === 0 ? "border-none" : ""
      } ${className}`}
      onScroll={onScroll}
    >
      {logs.map((log) => {
        return (
          <div className="flex-column width-max align-items-center" key={log.id}>
            <div
              key={log.id}
              className={`product-wrapper width-max order ${className} `}
            >
              <div
                className={`item order align-items-center flex-column pointer ${className} ${(log.action === AuditAction.CREATE && log.entityType === "User-Login") ? "info" : log.action === AuditAction.CREATE ? "create" :  log.action === AuditAction.UPDATE ? "edit" : "delete"}`}
                onClick={() => toggleLogs(log.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    toggleLogs(log.id);
                  }
                }}
              >
                <div
                  className={`log-item-row height-max width-max justify-center align-items-center flex`}
                >
                  {attributes.map((attr) => (
                    <div
                      key={`${log.id}-${attr.name}`}
                      className={`attribute-item flex ${
                        attr.name === "" ? "category-column" : ""
                      } ${className}`}
                      style={{
                        width: attr.width,
                        justifyContent: attr.justify,
                      }}
                    >
                      {renderAttributeContent(attr, log)}
                    </div>
                  ))}
                </div>
                {expandedLogsIds.includes(log.id) && (
                  <LogContent log={log} />
                )}
              </div>
            </div>
          </div>
        );
      })}
      {isLoading && (
        <span className="qv-span text-align-center">Ładowanie...</span>
      )}
      
    </div>
  );
}

export default LogsList;
