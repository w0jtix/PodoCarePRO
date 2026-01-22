import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { EmployeeRevenueFilter, EmployeeRevenue, EmployeeStats } from "../models/statistics";

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
}

export default StatisticsService;