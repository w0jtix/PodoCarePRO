import { Employee } from "./employee";


export interface CashLedger {
    id: number | null;
    date: string;
    openingAmount: number;
    deposit: number;
    closingAmount: number | null;
    cashOutAmount: number;
    note: string | null;
    createdBy?: Employee;
    closedBy?: Employee | null;
    isClosed?: boolean;
}


export interface CashLedgerFilterDTO {
    isClosed: boolean;
    year: number | null;
    month: number | null;
}