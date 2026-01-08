import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { NewVisit, Visit, VisitFilterDTO } from "../models/visit";

class VisitService {
  static async getVisits(
    filter?: VisitFilterDTO, 
    page: number = 0, 
    size: number = 30
  ): Promise<{ content: Visit[], totalPages: number, totalElements: number, last: boolean }> {
    return await sendApiRequest<{ content: Visit[], totalPages: number, totalElements: number, last: boolean }>(
      `visits/search?page=${page}&size=${size}`, 
      {
        method: "post",
        body: filter ?? {},
        errorMessage: "Error fetching Visits.",
      }
    );
  }

  static async getVisitPreview(visit: NewVisit): Promise<Visit> {
    return await sendApiRequest<Visit>(`visits/preview`, {
      method: "post",
      body: visit,
      errorMessage: "Error fetching Visit preview.",
    });
  }

  static async getVisitById(
    id: string | number,
  ): Promise<Visit> {
    return await sendApiRequest<Visit>(`visits/${id}`, {
        method: "get",
        body: {},
        errorMessage: `Error fetching Visit with given id: ${id}`
    });;
  }

  static async createVisit(visit: NewVisit): Promise<Visit> {
    return await sendApiRequest<Visit>("visits", {
      method: "post",
      body: visit,
      errorMessage: "Error creating new Visit.",
    });
  }

  /* static async updateVisit(
    id: string | number,
    visit: NewVisit
  ): Promise<Visit | undefined> {
    return await sendApiRequest<Visit>(`visits/${id}`, {
      method: "put",
      body: visit,
      errorMessage: "Error updating Visit.",
    });
  } */

  static async deleteVisit(id: string | number): Promise<void> {
    return await sendApiRequest<void>(`visits/${id}`, {
      method: "delete",
      body: {},
      errorMessage: `Error removing Visit with given id: ${id}`,
    });
  }

  static async findVisitPaidByVoucher(voucherId: string | number): Promise<Visit> {
    return await sendApiRequest<Visit>(`visits/search/voucher/${voucherId}`, {
      method: "get",
      body: {},
      errorMessage: `Error fetching Visit with given voucherId: ${voucherId}`,
    })
  }

  static async findVisitByDebtSourceId(debtId: string | number): Promise<Visit> {
    return await sendApiRequest<Visit>(`visits/search/debt/${debtId}`, {
      method: "get",
      body: {},
      errorMessage: `Error fetching Visit with given ClientDebtId: ${debtId}`,
    })
  }

  static async findVisitByDebtSourceVisitId(visitId: string | number): Promise<Visit> {
    return await sendApiRequest<Visit>(`visits/search/debt-source/${visitId}`, {
      method: "get",
      body: {},
      errorMessage: `Error fetching Visit with given visitId: ${visitId}`,
    })
  }

  static async findVisitByReviewId(reviewId: string | number): Promise<Visit> {
    return await sendApiRequest<Visit>(`visits/search/review/${reviewId}`, {
      method: "get",
      body: {},
      errorMessage: `Error fetching Visit with given reviewId: ${reviewId}`,
    })
  }


}

export default VisitService;
