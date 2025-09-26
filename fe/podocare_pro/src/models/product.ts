import { Brand, NewBrand } from "./brand";
import { ProductCategory } from "./product-category";


export interface Product {
    id: number;
    name: string;
    category: ProductCategory;
    brand: Brand;
    supply: number;
    description: string;
    isDeleted: boolean;
}

export interface NewProduct {
    name: string;
    category: ProductCategory;
    brand: Brand;
    supply: number;
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
