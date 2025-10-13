import { BaseServiceCategory, NewBaseServiceCategory } from "./categories";

export interface ServiceFilterDTO {
    keyword?: string;
    categoryIds?: number[] | null;
}

export interface BaseServiceAddOn {
    id: number;
    name: string;
    price: number;
    duration: number;
}

export interface NewBaseServiceAddOn {
    name: string;
    price: number;
    duration: number;
}

export interface BaseService {
    id: number;
    name: string;
    price: number;
    duration: number;
    variants: ServiceVariant[];
    category: BaseServiceCategory;
    addOns: BaseServiceAddOn[];
}

export interface NewBaseService {
    name: string;
    price: number;
    duration: number;
    variants: NewServiceVariant[] | ServiceVariant[];
    category: BaseServiceCategory | null;
    addOns: BaseServiceAddOn[];
}

export interface ServiceVariant {
    id: number;
    name: string;
    price: number;
    duration: number;
}

export interface NewServiceVariant {
    name: string;
    price: number;
    duration: number;
}