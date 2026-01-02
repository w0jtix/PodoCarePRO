export interface ProductCategory {
    id: number;
    name: string;
    color: string;
}

export interface NewProductCategory {
    name: string;
    color: string;
}

export interface BaseServiceCategory {
    id: number;
    name: string;
    color: string;
    isDeleted?: boolean;
}

export interface NewBaseServiceCategory {
    name: string;
    color: string;
}

export enum CategoryButtonMode {
    PREVIEW = "PREVIEW",
    SELECT = "SELECT",
    MULTISELECT = "MULTISELECT"
}