import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { EmployeeRevenueFilter, EmployeeRevenue, EmployeeStats, CompanyFinancialSummary, CompanyStats, CompanyRevenue } from "../models/statistics";

class StatisticsService {
    static async getEmployeeRevenue(filter: EmployeeRevenueFilter): Promise<EmployeeRevenue> {
        return await sendApiRequest<EmployeeRevenue>(`statistics/employee-revenue`, {
            method: "post",
            body: filter,
            errorMessage: "Error fetching Employee Revenue Statistics.",
        });
    }

    static async getEmployeeStats(filter: EmployeeRevenueFilter): Promise<EmployeeStats[]> {
        return await sendApiRequest<EmployeeStats[]>(`statistics/employee-stats`, {
            method: "post",
            body: filter,
            errorMessage: "Error fetching Employee Stats.",
        });
    }

    static async getCompanyFinancialSummary(filter: EmployeeRevenueFilter): Promise<CompanyFinancialSummary> {
        return await sendApiRequest<CompanyFinancialSummary>(`statistics/company-summary`, {
            method: "post",
            body: filter,
            errorMessage: "Error fetching Company Financial Summary.",
        });
    }

    static async getCompanyStats(filter: EmployeeRevenueFilter): Promise<CompanyStats> {
        return await sendApiRequest<CompanyStats>(`statistics/company-stats`, {
            method: "post",
            body: filter,
            errorMessage: "Error fetching Company Financial Statistics.",
        });
    }

    static async getCompanyRevenue(filter: EmployeeRevenueFilter): Promise<CompanyRevenue> {
        return await sendApiRequest<CompanyRevenue>(`statistics/company-revenue`, {
            method: "post",
            body: filter,
            errorMessage: "Error fetching Company Revenue.",
        });
    }
}

export default StatisticsService;