import { Employee } from "./employee";
import { Discount } from "./visit";

export interface ClientNote {
    id:number;
    client: Client,
    content: string;
    createdAt: string;
    createdBy: Employee;
}

export interface NewClientNote {
    content: string;
    client: Client;
    createdAt: string;
    createdBy: Employee | null;
}

export interface Client {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    signedRegulations: boolean;
    boostClient: boolean;
    redFlag: boolean;
    discount: Discount | null;
    hasDebts?: boolean;
    isDeleted?: boolean;
    visitsCount?: number;
    hasActiveVoucher?: boolean;
    hasGoogleReview?: boolean;
    hasBooksyReview?: boolean;
    hasActiveGoogleReview?: boolean;
}

export interface NewClient {
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    signedRegulations: boolean;
    boostClient: boolean;
    redFlag: boolean;
    discount?: Discount | null;
}

export interface ClientFilterDTO {
    keyword?: string | null;
    boostClient?: boolean| null;
    signedRegulations?: boolean | null;
    hasDebts?: boolean | null;
    discountId?: number | string | null;
}