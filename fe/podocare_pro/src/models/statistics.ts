import { ExpenseCategory } from "./expense";

export enum ChartMode {
    MONTHLY = "MONTHLY",
    DAILY = "DAILY",
}

export const chartModeItems = [
    { id: ChartMode.MONTHLY, name: "Miesięczny" },
    { id: ChartMode.DAILY, name: "Dzienny" },
  ];

export interface EmployeeRevenueFilter {
    mode: ChartMode;
    year: number |null;
    month?: number |null;
}

// Backend Data
export interface EmployeeRevenueSeries {
    employeeId: number;
    employeeName: string;
    data: number[];
}

export interface EmployeeRevenue {
    series: EmployeeRevenueSeries[];
}

// Frontend formatted BackendData
export interface FrontendEmployeeRevenueSeries {
    employeeId: number;
    employeeName: string;
    color: string;
    data: (number | null)[];
}

export interface FrontendEmployeeRevenue {
    labels: string[];
    series: FrontendEmployeeRevenueSeries[];
}

// Recharts Format
export interface ChartDataPoint {
    label: string;
    [employeeName: string]: string | number | null;
}


export interface EmployeeStats {
    id: number;
    name: string;
    avatar: string;
    hoursWithClients: number;
    availableHours: number;
    servicesRevenue: number;
    servicesRevenueGoal:number;
    productsRevenue: number;
    productsRevenueGoal:number;
    totalRevenue: number;
    totalRevenueGoal:number;
    servicesDone: number;
    productsSold: number;
    vouchersSold: number;
    newClients:number;
    clientsSecondVisitConversion: number;
    newBoostClients: number;
    boostClientsSecondVisitConversion: number;
    topSellingServiceName: string;
    topSellingProductName: string;
}

export interface CompanyFinancialSummary {
    currentRevenue: number;
    currentExpenses: number;
    currentIncome: number;

    previousPeriodRevenue: number;
    previousPeriodExpenses: number;
    previousPeriodIncome: number;

    lastYearRevenue: number;
    lastYearExpenses: number;
    lastYearIncome: number;

    revenueChangeVsPrevPeriod: number;
    expensesChangeVsPrevPeriod: number;
    incomeChangeVsPrevPeriod: number;

    revenueChangeVsLastYear: number;
    expensesChangeVsLastYear: number;
    incomeChangeVsLastYear: number;
}

export interface ExpenseCategoryBreakdown {
    category: ExpenseCategory;
    amount: number;
    sharePercent: number;
}

export interface CompanyStats {
    servicesRevenue: number;
    productsRevenue: number;
    totalRevenue: number;
    servicesRevenueShare: number;
    productsRevenueShare: number;

    totalExpenses: number;
    expensesByCategory: ExpenseCategoryBreakdown[];

    totalIncome: number;
    costShareInRevenue: number;
    profitabilityPercent: number;
}

export interface CompanyRevenue {
    revenueData: (number | null)[];
    expensesData: (number | null)[];
    incomeData: (number | null)[];
}