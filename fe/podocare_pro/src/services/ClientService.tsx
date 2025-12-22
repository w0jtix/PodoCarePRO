import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { Client, ClientFilterDTO, NewClient } from "../models/client";

class ClientService {

    static async getClients(filter?: ClientFilterDTO): Promise<Client[]> {
        return await sendApiRequest<Client[]>(`clients/search`, {
            method: "post",
            body: filter ?? {keyword: ""},
            errorMessage: "Error fetching Clients."
        })
    }

    static async createClient(service: NewClient): Promise<Client> {
        return await sendApiRequest<Client>( `clients`, {
        method: "post",
        body: service,
        errorMessage: "Error creating new Client."
    });
    }

    static async updateClient(id: string | number, service: NewClient): Promise<Client> {
        return await sendApiRequest<Client> (`clients/${id}`, {
            method: "put",
            body: service,
            errorMessage: "Error updating Client."
        })
    }

    static async deleteClient(id: string | number): Promise<void> {
        return await sendApiRequest<void>(`clients/${id}`, {
            method: "delete",
            errorMessage: "Error deleting Client."
        })
    }
}

export default ClientService;