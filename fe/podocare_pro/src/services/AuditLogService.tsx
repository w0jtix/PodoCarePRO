import { sendApiRequest } from "../components/send-api-request/SendApiRequest"
import { AuditLogFilterDTO, AuditLog } from "../models/audit_log"

class AuditLogService {

    static async getAuditLogs(filter: AuditLogFilterDTO, page: number = 0, size: number = 30):Promise<{content: AuditLog[], totalPages: number, totalElements: number, last: boolean}> {
        return await sendApiRequest<{content: AuditLog[], totalPages: number, totalElements: number, last: boolean }> (`audit-logs/search?page=${page}&size=${size}`, {
            method: "post",
            body: filter ?? {},
            errorMessage: "Error fetching Logs.",
        })
    }
}

export default AuditLogService;