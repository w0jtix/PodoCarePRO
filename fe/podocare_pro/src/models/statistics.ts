
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