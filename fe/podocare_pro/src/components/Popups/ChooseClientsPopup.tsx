import { useEffect, useState, useCallback } from "react";
import { useAlert } from "../Alert/AlertProvider";
import ReactDOM from "react-dom";
import ListHeader from "../ListHeader";
import { Client } from "../../models/client";
import { CLIENTS_DISCOUNT_LIST_ATTRIBUTES } from "../../constants/list-headers";
import SearchBar from "../SearchBar";
import ActionButton from "../ActionButton";
import ClientService from "../../services/ClientService";
import ClientsList from "../Clients/ClientsList";
import { Action } from "../../models/action";
import { AlertType } from "../../models/alert";

export interface ChooseClientsPopupProps {
  onClose: () => void;
  className?: string;
  handleSelectClients: (client:Client) => void;
  selectedClients: Client[];
  onSave: () => void;
}

export function ChooseClientsPopup({
  onClose,
  className = "",
  handleSelectClients,
  selectedClients,
  onSave,
}: ChooseClientsPopupProps) {
  const [keyword, setKeyword] = useState<string>("");
  const [clients, setClients] = useState<Client[]>([]);
  const { showAlert } = useAlert();

  const fetchClients = async (): Promise<void> => {
    ClientService.getClients({ keyword: keyword })
      .then((data) => {
        const sortedClients = [...data].sort((a, b) =>
          a.firstName.localeCompare(b.firstName, "pl", { sensitivity: "base" })
        );
        setClients(sortedClients);
      })
      .catch((error) => {
        setClients([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching Clients: ", error);
      });
  };

  useEffect(() => {
    fetchClients();
  }, [keyword]);

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
        className="manage-clients-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-1">
          <h2 className="popup-title">Wybierz Klientów</h2>
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
        <SearchBar onKeywordChange={setKeyword} className="mb-1" />
            <ListHeader attributes={CLIENTS_DISCOUNT_LIST_ATTRIBUTES} />
            <ClientsList
              attributes={CLIENTS_DISCOUNT_LIST_ATTRIBUTES}
              items={clients}
              className="services client"
              action={Action.SELECT}
              onClick={handleSelectClients}
              selectedClients={selectedClients}
            />
            <div className="flex width-max mt-1 align-items-center justify-center">
            <ActionButton
                src={"src/assets/tick.svg"}
                alt={"Zapisz"}
                text={"Zapisz"}
                onClick={onSave}
              />
              </div>
      </div>
      
    </div>,
    portalRoot
  );
}

export default ChooseClientsPopup;
