import React, { useEffect } from "react";
import { useState, useCallback } from "react";
import ActionButton from "../ActionButton";
import { ListAttribute } from "../../constants/list-headers";
import { formatTimestamp } from "../../utils/dateUtils";
import { AuditAction, AuditLog } from "../../models/audit_log";
import LogContent from "./LogContent";

const actionIconMap: Record<AuditAction, string> = {
  [AuditAction.CREATE]: "addNew",
  [AuditAction.UPDATE]: "edit",
  [AuditAction.DELETE]: "cancel",
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
  hasMore = true,
  handleResetFiltersAndData,
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
            src="src/assets/arrow_down.svg"
            alt="arrow down"
            className={`arrow-down ${
              expandedLogsIds.includes(log.id) ? "rotated" : ""
            }`}
          />
        );

        case " ":
        return (
          <img
            src={`src/assets/${actionIconMap[log.action]}.svg`}
            alt="action icon"
            className={`visit-form-icon ${actionIconMap[log.action]} ml-05`}
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
          <span className="order-values-lower-font-size ml-1">
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
          <span className="order-values-lower-font-size ml-05">
             {log.entityId} 
          </span>
        );

      case "   ":
        return (
          <span className="order-values-lower-font-size ml-1 entity-key-trait">
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

      

      default:
        return <span>{"-"}</span>;
    }
  };

  return (
    <div
      className={`item-list order width-93 grid p-0 mt-05 ${
        logs.length === 0 ? "border-none" : ""
      } ${className}`}
      onScroll={onScroll}
    >
      {logs.map((log, index) => {
        return (
          <div key={log.id}>
            <div
              key={log.id}
              className={`product-wrapper order ${className} `}
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
