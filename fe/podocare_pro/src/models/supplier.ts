export interface Supplier {
    id: number;
    name: string; 
    websiteUrl?: string;
}

export interface NewSupplier {
    name?: string; 
    websiteUrl?: string;
}