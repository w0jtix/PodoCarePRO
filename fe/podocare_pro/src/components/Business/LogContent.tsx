import { useState, useEffect } from "react";
import { AuditAction, AuditLog } from "../../models/audit_log";

export interface LogContentProps {
  log: AuditLog;
}

export function LogContent({ log }: LogContentProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string, side: "old" | "new") => {
    const fullKey = `${side}-${key}`;
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fullKey)) {
        newSet.delete(fullKey);
      } else {
        newSet.add(fullKey);
      }
      return newSet;
    });
  };

  useEffect(() => {
    console.log(log)
  },[])

  const parseValue = (value: string | null): Record<string, unknown> => {
    if (!value) return {};
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  };

  const oldData = parseValue(log.oldValue);
  const newData = parseValue(log.newValue);

  const allKeys = Array.from(
    new Set([...Object.keys(oldData), ...Object.keys(newData)])
  );

  // Prettify JSON with empty line between obj
  const prettyPrint = (obj: unknown): string => {
    const json = JSON.stringify(obj, null, 2);
    // Add empty line between obj
    return json.replace(/\},\n(\s+)\{/g, '},\n\n$1{');
  };

  const formatValue = (value: unknown, key: string, side: "old" | "new"): React.ReactNode => {
    if (value === null || value === undefined) return "null";

    // onClick for arrays and obj
    if (typeof value === "object") {
      const fullKey = `${side}-${key}`;
      const isExpanded = expandedKeys.has(fullKey);

      return (
        <span
          className="log-expandable pointer"
          onClick={() => toggleExpand(key, side)}
          title={isExpanded ? "Zwiń" : "Rozwiń"}
        >
          {isExpanded ? (
            <pre className="log-pretty-json">{prettyPrint(value)}</pre>
          ) : (
            <span className="log-compact-json">{JSON.stringify(value)}</span>
          )}
        </span>
      );
    }

    return String(value);
  };

  const isFieldRemoved = (key: string): boolean => {
    return key in oldData && !(key in newData);
  };

  const isFieldAdded = (key: string): boolean => {
    return !(key in oldData) && key in newData;
  };

  const isFieldChanged = (key: string): boolean => {
    return key in oldData && key in newData;
  };

  return (
    <div className="log-content-diff width-max" onClick={(e) => e.stopPropagation()}>
      <div className="log-diff-container flex g-10px width-max">
        <div className={`log-diff-side f-1 old ${log.action === AuditAction.CREATE ? "disabled" : ""}`}>
          <div className="log-diff-header">Przed zmianą</div>
          <div className="log-diff-body">
            {allKeys.map((key) => {
              const isRemoved = isFieldRemoved(key);
              const isChanged = log.action === AuditAction.UPDATE && isFieldChanged(key);
              return (
                <div key={key} className="log-diff-line flex">
                  <span className="log-diff-key">{key}:</span>
                  <span className={`log-diff-value ${isRemoved ? "removed" : ""} ${isChanged ? "changed-old" : ""}`}>
                    {key in oldData ? formatValue(oldData[key], key, "old") : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className={`log-diff-side f-1 new ${log.action === AuditAction.DELETE ? "disabled" : ""}`}>
          <div className="log-diff-header">Po zmianie</div>
          <div className="log-diff-body">
            {allKeys.map((key) => {
              const isAdded = isFieldAdded(key);
              const isChanged = log.action === AuditAction.UPDATE && isFieldChanged(key);
              return (
                <div key={key} className="log-diff-line flex">
                  <span className="log-diff-key">{key}:</span>
                  <span className={`log-diff-value ${isAdded ? "added" : ""} ${isChanged ? "changed-new" : ""}`}>
                    {key in newData ? formatValue(newData[key], key, "new") : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogContent;
