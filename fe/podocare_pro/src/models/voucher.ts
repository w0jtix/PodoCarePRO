import { Client } from "./client";

export enum VoucherStatus {
    ACTIVE = "ACTIVE",
    USED = "USED",
    EXPIRED = "EXPIRED"
}

export interface Voucher {
    id: number;
    value: number;
    issueDate: string;
    expiryDate: string;
    client: Client;
    status: VoucherStatus;
    purchaseVisitId?: number;
}

export interface NewVoucher {
    value?: number;
    client?: Client;
    issueDate?: string | null;
    expiryDate?: string | null;
}

export interface VoucherFilterDTO {
    status?: VoucherStatus | null;
    keyword?: string | null;
}

