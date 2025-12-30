import { Brand, NewBrand } from "./brand";
import { ProductCategory } from "./categories";
import { VatRate } from "./vatrate";


export interface Product {
    id: number;
    name: string;
    category: ProductCategory;
    brand: Brand;
    supply: number;
    sellingPrice?: number | null;
    vatRate: VatRate;
    description: string;
    isDeleted: boolean;
}

export interface NewProduct {
    name: string;
    category: ProductCategory | null;
    brand: Brand | NewBrand | null;
    supply: number;
    sellingPrice?: number | null;
    vatRate?: VatRate | null;
    description?: string;
    isDeleted?: boolean;
}

export interface ProductFilterDTO {
    productIds?: number[] | null;
    categoryIds?: number[] | null;
    brandIds?: number[] | null;
    keyword?: string;
    includeZero?: boolean;
    isDeleted?: boolean;
}
