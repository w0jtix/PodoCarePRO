import { Client } from "./client";
import { Visit } from "./visit";
import { PaymentStatus } from "./payment";

export enum DebtType {
    ABSENCE_FEE = "ABSENCE_FEE",
    PARTIAL_PAYMENT = "PARTIAL_PAYMENT",
    UNPAID = "UNPAID"
}

export interface DebtRedemption {
    id: number;
    debtSource: ClientDebt;
}

export interface NewDebtRedemption {
    debtSource: ClientDebt;
}

export interface ClientDebt {
    id:number;
    client: Client;
    sourceVisit: Visit | null;
    type: DebtType;
    value: number;
    paymentStatus: PaymentStatus;
    createdAt: string | null;
}

export interface NewClientDebt {
    type: DebtType;
    value: number;
    client?: Client;
    createdAt?: string | null;
    paymentStatus?: PaymentStatus;
}

export interface DebtFilterDTO {
    paymentStatus?: PaymentStatus | null;
    keyword?: string | null;
}