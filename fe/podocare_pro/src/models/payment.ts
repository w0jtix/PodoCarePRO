import { Voucher } from "./voucher";

export interface Payment {
    id: number;
    method: PaymentMethod;
    amount: number;
    voucher: Voucher | null;
}

export interface NewPayment {
    method: PaymentMethod | null;
    amount: number;
    voucher?: Voucher | null; /* only if paid by Voucher attach it */
}

export enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    BLIK = "BLIK",
    TRANSFER = "TRANSFER",
    VOUCHER = "VOUCHER"
}

export enum PaymentStatus {
    PAID = "PAID",
    PARTIAL = "PARTIAL",
    UNPAID = "UNPAID"
}