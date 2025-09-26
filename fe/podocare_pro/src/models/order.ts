import { OrderProduct, NewOrderProduct } from "./order-product";
import { Supplier } from "./supplier";
import { VatRate } from "./vatrate";

export interface Order {
    id: number;
    supplier: Supplier;
    orderNumber: number;
    orderDate: string;
    orderProducts: OrderProduct[];
    shippingVatRate: VatRate;
    shippingCost: number;
    totalNet: number;
    totalVat: number;
    totalValue: number;
}

export interface NewOrder {
    supplier?: Supplier;
    orderDate?: string;
    orderProducts?: NewOrderProduct[];
    shippingVatRate: VatRate;
    shippingCost: number;
    totalNet: number;
    totalVat: number;
    totalValue: number;
}

export interface OrderFilterDTO {
    supplierIds?: number[] | null;
    dateFrom?: string | null;
    dateTo?: string | null;
}
