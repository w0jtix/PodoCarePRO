import { PaymentMethod, PaymentStatus } from "../models/payment";

export function translatePaymentMethod (method: PaymentMethod): string {
    switch (method) {
        case PaymentMethod.CASH:
            return "Gotówka";
        case PaymentMethod.CARD:
            return "Karta";
        case PaymentMethod.BLIK:
            return "Blik";
        case PaymentMethod.TRANSFER:
            return "Przelew";
        case PaymentMethod.VOUCHER:
            return "Voucher";
        default:
            return method;
    }
};

export function translatePaymentStatus (status: PaymentStatus): string {
    switch(status) {
        case PaymentStatus.PAID:
            return "OPŁACONE";
        case PaymentStatus.PARTIAL:
            return "CZĘŚCIOWO";
        case PaymentStatus.UNPAID:
            return "NIEOPŁACONE"
        default:
            return status;
    }
}