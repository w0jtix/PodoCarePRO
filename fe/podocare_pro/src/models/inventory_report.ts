import { Employee } from "./employee";
import { Product } from "./product";

export interface InventoryReportItem {
    id: number;
    product: Product;
    supplyBefore: number;
    supplyAfter: number;
}

export interface NewInventoryReportItem {
    product: Product;
    supplyBefore: number;
    supplyAfter: number | undefined;
}

export interface InventoryReport {
    id: number;
    createdBy: Employee;
    createdAt: string;
    items: InventoryReportItem[];
    approved:boolean;
}

export interface NewInventoryReport {
    items: NewInventoryReportItem[];
}

export interface InventoryReportFilterDTO {
    employeeId?: number | null;
    year?: number | null;
    month?: number | null;
}