import { Product } from "./product";
import { VatRate } from "./vatrate";
import { Order } from "./order";

export interface OrderProduct {
    id:number;
    order: Order;
    product: Product;
    name: string;
    quantity: number;
    vatRate: VatRate;
    price: number;
}

export interface NewOrderProduct {
    product: Product | null;
    name: string;
    quantity: number;
    vatRate: VatRate;
    price: number;
}

