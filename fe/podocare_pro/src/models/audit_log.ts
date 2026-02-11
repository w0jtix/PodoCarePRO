export enum AuditAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE"
}

export interface AuditLog {
    id: number;
    entityType: string;
    entityId: number;
    entityKeyTrait: string;
    action : AuditAction;
    performedBy: string;
    timestamp: string;
    oldValue: string | null;
    newValue: string | null;
    changedFields: string;
}

export interface AuditLogFilterDTO {
    entityType: string | null;
    keyword: string | null;
    action : AuditAction | null;
    performedBy: string | null;
    dateFrom: string | null;
    dateTo: string | null;
}