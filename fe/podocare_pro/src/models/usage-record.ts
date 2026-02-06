import { Product } from "./product";
import { Employee } from "./employee";

export enum UsageReason {
    OUT_OF_DATE = 'OUT_OF_DATE',
    REGULAR_USAGE= 'REGULAR_USAGE'
}

export interface UsageRecord {
    id: number;
    product: Product;
    employee: Employee;
    usageDate: string;
    quantity: number;
    usageReason: UsageReason;
}

export interface NewUsageRecord {
    product: Product | null,
    employee: Employee | null,
    usageDate: string;
    quantity: number;
    usageReason: UsageReason;
}

export interface UsageRecordItem {
    product: Product;
    quantity: number;
    usageReason: UsageReason;
}

export interface UsageRecordFilterDTO {
    keyword: string;
    employeeIds?: number[] | null;
    usageReason?: UsageReason | null;
    startDate?: string | null;
    endDate?: string | null;
}

export function getUsageReasonDisplay(reason: UsageReason): string {
    switch (reason) {
        case UsageReason.OUT_OF_DATE:
            return "PO DACIE";
        case UsageReason.REGULAR_USAGE:
            return "ZUŻYCIE";
        default:
            return reason;
    }
}