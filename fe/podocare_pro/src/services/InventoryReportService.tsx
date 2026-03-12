import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import {
  InventoryReport,
  NewInventoryReport,
  InventoryReportFilterDTO,
} from "../models/inventory_report";

class InventoryReportService {
  static async getInventoryReportById(
    reportId: number | string,
  ): Promise<InventoryReport> {
    return await sendApiRequest<InventoryReport>(
      `inventory-reports/${reportId}`,
      {
        method: "get",
        errorMessage: "Error fetching Inventory Report.",
      },
    );
  }

  static async getInventoryReports(
    filter: InventoryReportFilterDTO,
    page: number = 0,
    size: number = 30,
  ): Promise<{
    content: InventoryReport[];
    totalPages: number;
    totalElements: number;
    last: boolean;
  }> {
    return await sendApiRequest<{
      content: InventoryReport[];
      totalPages: number;
      totalElements: number;
      last: boolean;
    }>(`inventory-reports/search?page=${page}&size=${size}`, {
      method: "post",
      body: filter,
      errorMessage: "Error fetching Inventory Reports.",
    });
  }

  static async createInventoryReport(
    report: NewInventoryReport,
  ): Promise<InventoryReport> {
    return await sendApiRequest<InventoryReport>("inventory-reports", {
      method: "post",
      body: report,
      errorMessage: "Error creating new Inventory Report",
    });
  }

  static async updateInventoryReport(
    id: number,
    report: NewInventoryReport,
  ): Promise<InventoryReport> {
    return await sendApiRequest<InventoryReport>(`inventory-reports/${id}`, {
      method: "put",
      body: report,
      errorMessage: "Error updatingInventory Report",
    });
  }

  static async approveReport(id: number): Promise<InventoryReport> {
    return await sendApiRequest<InventoryReport>(
      `inventory-reports/${id}/approve`,
      {
        method: "patch",
        errorMessage: "Error while approving Inventory Report",
      },
    );
  }

  static async areAllApproved(): Promise<boolean> {
    return await sendApiRequest<boolean>("inventory-reports/all-approved", {
      method: "get",
      errorMessage: "Error checking approval status of Inventory Reports",
    });
  }

  static async deleteInventoryReport(id: number): Promise<void> {
    return await sendApiRequest<void>(`inventory-reports/${id}`, {
      method: "delete",
      errorMessage: "Error removing Inventory Report",
    });
  }
}

export default InventoryReportService;
