import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { BaseService, NewBaseService, ServiceFilterDTO } from "../models/service";

class BaseServiceService {

    static async getServices(filter?: ServiceFilterDTO): Promise<BaseService[]> {
        return await sendApiRequest<BaseService[]>(`services/search`, {
            method: "post",
            body: filter ?? {},
            errorMessage: "Error fetching Services."
        })
    }

    static async getServiceByCategoryId(categoryId: string | number) : Promise<BaseService> {
        return await sendApiRequest<BaseService>(`services/category/${categoryId}`, {
            method: "get",
            errorMessage: "Error fetching Service by Category."
        });
    }

    static async createService(service: NewBaseService): Promise<BaseService> {
        return await sendApiRequest<BaseService>( `services`, {
        method: "post",
        body: service,
        errorMessage: "Error creating new Service."
    });
    }

    static async updateService(id: string | number, service: NewBaseService): Promise<BaseService> {
        return await sendApiRequest<BaseService> (`services/${id}`, {
            method: "put",
            body: service,
            errorMessage: "Error updating Service."
        })
    }

    static async deleteService(id: string | number): Promise<void> {
        return await sendApiRequest<void>(`services/${id}`, {
            method: "delete",
            errorMessage: "Error deleting Service."
        })
    }
}

export default BaseServiceService;