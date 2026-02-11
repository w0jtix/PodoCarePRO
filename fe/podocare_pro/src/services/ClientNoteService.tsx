
import { ClientNote, NewClientNote } from "../models/client";
import { sendApiRequest } from "../components/send-api-request/SendApiRequest";

class ClientNoteService {
  static async getClientNoteById(
    id: string | number,
  ): Promise<ClientNote> {
    return await sendApiRequest<ClientNote>(`client-notes/${id}`, {
        method: "get",
        body: {},
        errorMessage: `Error fetching ClientNote with given id: ${id}`
    });;
  }

  static async getClientNotesByClientId(
    clientId: string | number,
  ): Promise<ClientNote[]> {
    return await sendApiRequest<ClientNote[]>(`client-notes/client/${clientId}`, {
        method: "get",
        body: {},
        errorMessage: `Error fetching ClientNote with given clientId: ${clientId}`
    });;
  }

  static async createClientNote(
    clientNote: NewClientNote
  ): Promise<ClientNote> {
    return await sendApiRequest<ClientNote>("client-notes", {
      method: "post",
      body: clientNote,
      errorMessage: "Error creating new ClientNote.",
    });
  }

  static async updateClientNote(
    id: string | number,
    clientNote: NewClientNote
  ): Promise<ClientNote | undefined> {
    return await sendApiRequest<ClientNote>(`client-notes/${id}`, {
      method: "put",
      body: clientNote,
      errorMessage: "Error updating ClientNote.",
    });
  }

  static async removeClientNote(
    id: string | number,
  ): Promise<void> {
    return await sendApiRequest<void>(`client-notes/${id}`, {
        method: "delete",
        body: {},
        errorMessage: `Error removing ClientNote with given id: ${id}`
    });
  }
  
}

export default ClientNoteService;
