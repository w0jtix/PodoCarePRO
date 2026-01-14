import { BaseServiceCategory, NewBaseServiceCategory } from "./categories";

export interface ServiceFilterDTO {
    keyword?: string;
    categoryIds?: number[] | null;
}

export interface BaseService {
    id: number;
    name: string;
    price: number;
    duration: number;   
    isDeleted?: boolean;
    variants: ServiceVariant[];
    category: BaseServiceCategory;
}

export interface NewBaseService {
    name: string;
    price: number;
    duration: number;
    variants: NewServiceVariant[] | ServiceVariant[];
    category: BaseServiceCategory | null;
}

export interface ServiceVariant {
    id: number;
    name: string;
    price: number;
    duration: number;   
    isDeleted?: boolean;
}

export interface NewServiceVariant {
    name: string;
    price: number;
    duration: number;
}