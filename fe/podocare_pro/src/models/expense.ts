import { VatRate } from "./vatrate";


export enum ExpenseCategory {
    RENT = "RENT",
    FEES = "FEES",
    ZUS = "ZUS",
    EQUIPMENT = "EQUIPMENT",
    SALARY = "SALARY",
    UNRELATED = "UNRELATED",
    OTHER = "OTHER"
}

export const expenseCategoryItems = [
    { id: ExpenseCategory.RENT, name: "Czynsz", color: "255, 70, 162" },
    { id: ExpenseCategory.FEES, name: "Podatki", color: "220,20,60" },
    { id: ExpenseCategory.ZUS, name: "ZUS", color: "30,144,255" },
    { id: ExpenseCategory.EQUIPMENT, name: "Przedmioty Gabinetowe", color: "147,112,219" },
    { id: ExpenseCategory.SALARY, name: "Pensje", color: "34,139,34" },
    { id: ExpenseCategory.UNRELATED, name: "Nie związane", color: "128,128,128" },
    { id: ExpenseCategory.OTHER, name: "Inne", color: "255,140,0" },
  ];

export function getExpenseCategoryDisplay(category: ExpenseCategory): string {
    switch (category) {
        case ExpenseCategory.RENT:
            return "Czynsz";
        case ExpenseCategory.FEES:
            return "Podatki";
        case ExpenseCategory.ZUS:
        return "ZUS";
        case ExpenseCategory.EQUIPMENT:
        return "Przedmioty Gabinetowe";
        case ExpenseCategory.SALARY:
        return "Pensje";
        case ExpenseCategory.UNRELATED:
        return "Nie związane";
        case ExpenseCategory.OTHER:
        return "Inne";
        default:
            return category;
    }
}


export interface CompanyExpenseItem {
    id: number;
    name: string;
    quantity: number;
    vatRate: VatRate;
    price: number;
}

export interface NewCompanyExpenseItem {
    name: string;
    quantity: number;
    vatRate: VatRate | null;
    price: number;
}

export interface CompanyExpense {
    id: number;
    source: string;
    expenseDate: string;
    invoiceNumber: string | null;
    category: ExpenseCategory;
    expenseItems: CompanyExpenseItem[];
    totalNet: number;
    totalVat: number;
    totalValue: number;
}

export interface NewCompanyExpense {
    source: string;
    expenseDate: string;
    invoiceNumber: string | null;
    category: ExpenseCategory | null;
    expenseItems: NewCompanyExpenseItem[];
}

export interface ExpenseFilterDTO {
    categories?: ExpenseCategory[] | null;    
    year?: number | null;
    month?: number | null;
}