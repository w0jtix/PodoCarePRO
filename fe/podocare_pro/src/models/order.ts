import { OrderProduct, NewOrderProduct } from "./order-product";
import { Supplier } from "./supplier";

export interface Order {
    id: number;
    supplier: Supplier;
    orderNumber: number;
    orderDate: string;
    orderProducts: OrderProduct[];
    shippingCost: number;
    totalNet: number;
    totalVat: number;
    totalValue: number;
}

export interface NewOrder {
    supplier?: Supplier | null;
    orderDate?: string;
    orderProducts?: NewOrderProduct[];
    shippingCost: number;
}

export interface OrderFilterDTO {
    supplierIds?: number[] | null;
    month?: number | null;
    year?:number;
}
