import { Product } from "./product";
import { NewVoucher, Voucher } from "./voucher";


export interface Sale {
    id:number;
    items: SaleItem[];
    totalNet: number;
    totalVat: number;
    totalValue: number;
}

export interface NewSale {
    items: NewSaleItem[];
}

export interface SaleItem {
    id: number;
    product: Product | null;
    voucher: Voucher | null;
    name: string;
    netValue: number;
    vatValue: number;
    price: number;
}

export interface NewSaleItem {
    product?: Product;
    voucher?: NewVoucher;
    name?: string;
    price: number;
}