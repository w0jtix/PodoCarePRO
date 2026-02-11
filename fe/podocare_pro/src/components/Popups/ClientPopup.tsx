import { Action } from "../../models/action";
import {
  Client,
  ClientNote,
  NewClient,
  NewClientNote,
} from "../../models/client";
import { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import ClientForm from "../Clients/ClientForm";
import ActionButton from "../ActionButton";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import {
  validateClientForm,
  validateClientNoteForm,
} from "../../utils/validators";
import { extractClientErrorMessage } from "../../utils/errorHandler";
import ClientService from "../../services/ClientService";
import ClientNoteService from "../../services/ClientNoteService";
import { Alert } from "react-bootstrap";

export interface ClientPopupProps {
  onClose: () => void;
  onReset: () => void;
  selectedClientId?: number | null;
  className: string;
  onSelectClient?: (client: Client) => void;
}

export function ClientPopup({
  onClose,
  onReset,
  selectedClientId,
  className = "",
  onSelectClient,
}: ClientPopupProps) {
  const [clientDTO, setClientDTO] = useState<NewClient>({
    firstName: "",
    lastName: "",
    signedRegulations: false,
    boostClient: false,
    redFlag: false,
    phoneNumber: null,
  });
  const [fetchedClient, setFetchedClient] = useState<Client | null>(null);
  const [newClientNotesDTO, setNewClientNotesDTO] = useState<NewClientNote[]>(
    []
  );
  const [existingClientNotes, setExistingClientNotes] = useState<ClientNote[]>(
    []
  );
  const [existingClientNotesIdsToRemove, setExistingClientNotesIdsToRemove] = useState<number[]>([]);
  const { showAlert } = useAlert();

  const action = selectedClientId ? Action.EDIT : Action.CREATE;

  const fetchClientById = async (clientId: number) => {
    ClientService.getClientById(clientId)
      .then((data) => {
        setClientDTO({
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          signedRegulations: data.signedRegulations,
          boostClient: data.boostClient,
          redFlag: data.redFlag,
          phoneNumber: data.phoneNumber,
          discount:data.discount,
        });
        setFetchedClient(data)
      })
      .catch((error) => {
        console.error("Error fetching Client!", error);
        showAlert("Błąd", AlertType.ERROR);
      })
  }

  const handleClientAction = useCallback(async () => {
    try {
      if (action === Action.CREATE) {
        const error = validateClientForm(clientDTO, action, null);
        if (error) {
          showAlert(error, AlertType.ERROR);
          return;
        }

        const createdClient = await ClientService.createClient(clientDTO as NewClient);
        onSelectClient?.(createdClient);
        showAlert(
          `Klient ${clientDTO.firstName + " " + clientDTO.lastName} utworzony!`,
          AlertType.SUCCESS
        );
        onReset?.();
        onClose();
      } else {
        const clientError = validateClientForm(clientDTO, action, fetchedClient);
        const hasClientChanges = clientError !== "Brak zmian!";

        const notesError = validateClientNoteForm(newClientNotesDTO);
        const hasNewNotes = newClientNotesDTO.length > 0 && !notesError;
        const hasNotesToRemove = existingClientNotesIdsToRemove.length > 0;

        if (!hasClientChanges && !hasNewNotes && !hasNotesToRemove) {
          showAlert("Nie wykryto żadnych zmian", AlertType.ERROR);
          return;
        }

        if (clientError && clientError !== "Brak zmian!") {
          showAlert(clientError, AlertType.ERROR);
          return;
        }

        if (notesError && newClientNotesDTO.length > 0) {
          showAlert(notesError, AlertType.ERROR);
          return;
        }

        if (hasNotesToRemove) {
          await Promise.all(
            existingClientNotesIdsToRemove.map((id) => ClientNoteService.removeClientNote(id))
          );
        }

        if (hasClientChanges && fetchedClient) {
          await ClientService.updateClient(
            fetchedClient.id,
            clientDTO as NewClient
          );
        }

        if (hasNewNotes) {
          await Promise.all(
            newClientNotesDTO.map((note) => ClientNoteService.createClientNote(note))
          );
        }

        showAlert(
          `Klient ${clientDTO.firstName + " " + clientDTO.lastName} zaktualizowany!`,
          AlertType.SUCCESS
        );
        onReset?.();
        onClose();
      }
    } catch (error) {
      console.error(
        `Error ${action === Action.CREATE ? "creating" : "updating"} client:`,
        error
      );
      const errorMessage = extractClientErrorMessage(error, action);
      showAlert(errorMessage, AlertType.ERROR);
    }
  }, [clientDTO, action, selectedClientId, newClientNotesDTO, existingClientNotesIdsToRemove, onReset, onClose, showAlert, onSelectClient]);


  const fetchClientNotes = async (clientId: number) => {
    ClientNoteService.getClientNotesByClientId(clientId)
    .then ((data) => {
      const sortedNotes = [...data].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setExistingClientNotes(sortedNotes);
    })
    .catch((error) => {
      console.error("Error fetching ClientNotes!", error);
      showAlert("Błąd", AlertType.ERROR);
    })
  }

  useEffect(() => {
    if (selectedClientId) {
      fetchClientById(selectedClientId);
      fetchClientNotes(selectedClientId);
    }
  }, [selectedClientId]);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }
  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay flex justify-center align-items-start ${className}`}
      onClick={onClose}
    >
      <div
        className="client-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2">
          <h2 className="popup-title">
            {action === Action.CREATE
              ? "Dodaj Nowego Klienta"
              : "Edytuj Klienta"}
          </h2>
          <button
            className="popup-close-button transparent border-none flex align-items-center justify-center absolute pointer"
            onClick={onClose}
          >
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="custom-form-section width-90 mb-15">
          <ClientForm
            setClientDTO={setClientDTO}
            clientDTO={clientDTO}
            action={action}
            className={""}
            setNewClientNotesDTO={setNewClientNotesDTO}
            newClientNotesDTO={newClientNotesDTO}
            existingClientNotes={existingClientNotes}
            setExistingClientNotes={setExistingClientNotes}
            setExistingClientNotesIdsToRemove={setExistingClientNotesIdsToRemove}
          />
        </section>

        <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={handleClientAction}
        />
      </div>
    </div>,
    portalRoot
  );
}

export default ClientPopup;
