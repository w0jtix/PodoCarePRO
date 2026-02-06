export enum EmploymentType {
    QUARTER = "QUARTER",
    HALF = "HALF",
    THREE_QUARTERS = "THREE_QUARTERS",
    FULL = "FULL"
}

export interface Employee {
    id: number;
    name: string;
    secondName: string;   
    isDeleted?: boolean;
    employmentType: EmploymentType;
    bonusPercent: number;
    saleBonusPercent: number;
}


export interface NewEmployee {
    name?: string;
    secondName?: string;
    employmentType?: EmploymentType;
    bonusPercent?: number | null;
    saleBonusPercent?: number | null;
}