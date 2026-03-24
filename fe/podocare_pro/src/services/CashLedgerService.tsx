import { CashLedger, CashLedgerFilterDTO } from "../models/cash_ledger";

import { sendApiRequest } from "../components/send-api-request/SendApiRequest";

class CashLedgerService {

  static async getCashLedgers(filter: CashLedgerFilterDTO, page: number = 0, size: number = 40): Promise<{ content: CashLedger[], totalPages: number, totalElements: number, last: boolean }> {
    return await sendApiRequest<{ content: CashLedger[], totalPages: number, totalElements: number, last: boolean }>(`cash-ledger/search?page=${page}&size=${size}`, {
      method: "post",
      body: filter,
      errorMessage: "Error fetching CashLedgers."
    });
  }

  static async getCashLedgerById(id: number): Promise<CashLedger> {
    return await sendApiRequest<CashLedger>(`cash-ledger/${id}`, {
      method: "get",
      body: {},
      errorMessage: "Error fetching CashLedger."
    });
  }

  static async getLastOpenCashLedger(): Promise<CashLedger> {
    return await sendApiRequest<CashLedger>(`cash-ledger/last-open`, {
      method: "get",
      body: {},
      errorMessage: "Error fetching existing open CashLedger."
    });
  }

  static async getTodayLedger(): Promise<CashLedger> {
    return await sendApiRequest<CashLedger>(`cash-ledger/today`, {
      method: "get",
      body: {},
      errorMessage: "Error fetching CashLedger."
    });
  }

  static async getLastClosingAmount(): Promise<number> {
    return await sendApiRequest<number>(`cash-ledger/last-closing-amount`, {
      method: "get",
      body: {},
      errorMessage: "Error fetching last closingAmount."
    });
  }

  static async openCashLedger(cashLedger: CashLedger): Promise<CashLedger> {
    return await sendApiRequest<CashLedger>("cash-ledger", {
      method: "post",
      body: cashLedger,
      errorMessage: "Error creating new CashLedger.",
    });
  }

  static async updateCashLedger(id: number, cashLedger: CashLedger): Promise<CashLedger> {
    return await sendApiRequest<CashLedger>(`cash-ledger/${id}`, {
      method: "put",
      body: cashLedger,
      errorMessage: "Error updating CashLedger.",
    });
  }

  static async closeCashLedger(id: number, cashLedger: CashLedger): Promise<CashLedger> {
    return await sendApiRequest<CashLedger>(`cash-ledger/${id}/close`, {
      method: "put",
      body: cashLedger,
      errorMessage: "Error closing CashLedger.",
    });
  }
}

export default CashLedgerService;
