export enum EmploymentType {
    QUARTER = "QUARTER",
    HALF = "HALF",
    THREE_QUARTERS = "THREE_QUARTERS",
    FULL = "FULL"
}

export interface Employee {
    id: number;
    name: string;
    lastName: string;   
    isDeleted?: boolean;
    employmentType: EmploymentType;
    bonusPercent: number;
    saleBonusPercent: number;
}


export interface NewEmployee {
    name?: string;
    lastName?: string;
    employmentType?: EmploymentType;
    bonusPercent?: number | null;
    saleBonusPercent?: number | null;
}



export interface EmployeeBonusFilterDTO {
    employeeId?: number | null;
    month?: number | null;
    year?: number | null;
}

export interface BonusVisit {
    visitId: number;
    clientName: string;
    date: string;
    paymentsSum: number;
    voucherPaymentsSum: number;
    productsValue: number;
    adjustedRevenue: number;
}

export interface BonusProduct {
    productId: number;
    productName: string;
    brandName: string;
    quantitySold: number;
    totalBonus: number;
    noPurchaseHistory: boolean;
    fallbackPurchasePriceUsed: boolean;
    items: BonusProductItem[]
}

export interface BonusProductItem {
    saleDate: string;
    avgPurchaseNetPrice: number;
    avgPurchaseGrossPrice: number;
    saleNetPrice: number;
    saleGrossPrice: number;
    margin: number;
    bonusPerUnit: number;
}

export interface EmployeeBonus {
    employeeId: number;
    employeeName: string;
    visits: BonusVisit[];
    monthlyServicesRevenue: number;
    boostCost: number;
    bonusThreshold: number;
    bonusPercent: number;
    bonusAmount: number;

    products: BonusProduct[];
    monthlyProductsRevenue: number;
    saleBonusPercent: number;
    productBonusAmount: number;
    prevMonthSaleBonus: number | null;
    twoMonthPrevSaleBonus: number | null;
}