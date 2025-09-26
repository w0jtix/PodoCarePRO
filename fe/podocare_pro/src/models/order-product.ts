import { Product } from "./product";
import { VatRate } from "./vatrate";
import { Order } from "./order";

export interface OrderProduct {
    id:number;
    order: Order;
    product: Product;
    quantity: number;
    vatRate: VatRate;
    price: number;
}

export interface NewOrderProduct {
    product: Product;
    quantity: number;
    vatRate: VatRate;
    price: number;
}

