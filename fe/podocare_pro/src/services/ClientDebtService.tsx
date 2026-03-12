
import { ClientDebt, NewClientDebt, DebtFilterDTO } from "../models/debt";
import { sendApiRequest } from "../components/send-api-request/SendApiRequest";

class ClientDebtService {
  static async getDebts(filter?: DebtFilterDTO): Promise<ClientDebt[]> {
    return await sendApiRequest<ClientDebt[]>(`client_debts/search`, {
      method: "post",
      body: filter ?? {},
      errorMessage: "Error fetching debts.",
    });
  }

  static async getDebtById(
    id: string | number,
  ): Promise<ClientDebt> {
    return await sendApiRequest<ClientDebt>(`client_debts/${id}`, {
        method: "get",
        body: {},
        errorMessage: `Error fetching Debt with given id: ${id}`
    });;
  }

  static async getDebtBySourceVisitId(
    visitId: string | number,
  ): Promise<ClientDebt> {
    return await sendApiRequest<ClientDebt>(`client_debts/visit/${visitId}`, {
        method: "get",
        body: {},
        errorMessage: `Error fetching Debt with given visitId: ${visitId}`
    });;
  }

  static async getUnpaidDebtsByClientId(
    clientId: string | number,
  ): Promise<ClientDebt[]>{
    return await sendApiRequest<ClientDebt[]>(`client_debts/client/${clientId}`, {
        method: "get",
        body: {},
        errorMessage: `Error fetching Debt with given clientId: ${clientId}`
    });;
  }

  static async createDebt(
    debt: NewClientDebt
  ): Promise<ClientDebt> {
    return await sendApiRequest<ClientDebt>("client_debts", {
      method: "post",
      body: debt,
      errorMessage: "Error creating new Debt.",
    });
  }

  static async updateDebt(
    id: string | number,
    debt: NewClientDebt
  ): Promise<ClientDebt | undefined> {
    return await sendApiRequest<ClientDebt>(`client_debts/${id}`, {
      method: "put",
      body: debt,
      errorMessage: "Error updating Debt.",
    });
  }

  static async removeDebt(
    id: string | number,
  ): Promise<void> {
    return await sendApiRequest<void>(`client_debts/${id}`, {
        method: "delete",
        body: {},
        errorMessage: `Error removing Debt with given id: ${id}`
    });
  }
  
}

export default ClientDebtService;
