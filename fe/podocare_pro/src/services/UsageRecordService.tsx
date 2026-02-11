import { UsageRecord, UsageRecordFilterDTO, NewUsageRecord } from "../models/usage-record";
import { sendApiRequest } from "../components/send-api-request/SendApiRequest";

class UsageRecordService {

  static async getUsageRecordById(usageRecordId: number | string): Promise<UsageRecord> {
    return await sendApiRequest<UsageRecord>(`usage-records/${usageRecordId}`, {
      method: "get",
      errorMessage: "Error fetching UsageRecords."
    })
  }

  static async getUsageRecords(
    filter: UsageRecordFilterDTO,
    page: number = 0, 
    size: number = 30
  ): Promise<{ content: UsageRecord[], totalPages: number, totalElements: number, last: boolean }> {
    return await sendApiRequest<{ content: UsageRecord[], totalPages: number, totalElements: number, last: boolean }>(`usage-records/search?page=${page}&size=${size}`, {
      method: "post",
      body: filter,
      errorMessage: "Error fetching UsageRecords."
    })
  }

  static async createUsageRecord(usageRecord: NewUsageRecord): Promise<UsageRecord> {
    return await sendApiRequest<UsageRecord>('usage-records', {
      method: "post",
      body: usageRecord,
      errorMessage: "Error creating new UsageRecord.",
    })
  }

  static async createUsageRecords(usageRecords: NewUsageRecord[]): Promise<UsageRecord[]> {
    return await sendApiRequest<UsageRecord[]>('usage-records/batch', {
      method: "post",
      body: usageRecords,
      errorMessage: "Error batch creating new UsageRecords.",
    })
  }

  static async deleteUsageRecord(id: number): Promise<void> {
    return await sendApiRequest<void>(`usage-records/${id}`, {
      method: "delete",
      errorMessage: "Error removing UsageRecord.",
    })
  }
}

export default UsageRecordService;
