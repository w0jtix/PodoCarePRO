import { useState, useEffect, useCallback } from "react";
import ActionButton from "../ActionButton";
import { Client } from "../../models/client";
import ChooseClientsPopup from "../Popups/ChooseClientsPopup";

export interface DisplayClientsListProps {
  className?: string;
  clients: Client[];
  onClientsChange:(clients: Client[]) => void;
}

export function DisplayClientsList({ className = "", clients, onClientsChange }: DisplayClientsListProps) {
  const [isManageClientsPopupOpen, setIsManageClientsPopupOpen] = useState<boolean>(false);
  const [tempClients, setTempClients] = useState<Client[]>(clients);

  useEffect(() => {
    if (isManageClientsPopupOpen) {
      setTempClients(clients);
    }
  }, [isManageClientsPopupOpen, clients]);

  const handleToggleClient = useCallback((selected: Client) => {
    setTempClients((prev) =>
      prev.some((a) => a.id === selected.id)
        ? prev.filter((a) => a.id !== selected.id)
        : [...prev, selected]
    );
  }, []);

  const handleSaveClients = useCallback(() => {
    onClientsChange(tempClients);
    setIsManageClientsPopupOpen(false);
  }, [tempClients, onClientsChange]);

  return (
    <div className="clients-container flex-column width-max mt-1">
      <div className="addons-list-header flex space-between g-2 align-items-center">
        <div className="addons-title-count flex align-items-center g-1">
          <img src="src/assets/klienci_yellow.svg" alt="Klienci" className="klienci-icon"></img>
          <span className="addons-title">Klienci:</span>
          <span className="addons-title">{clients.length}</span>
        </div>
        <ActionButton
          src={"src/assets/manage.svg"}
          alt={"Zarządzaj"}
          text={"Zarządzaj"}
          onClick={() => setIsManageClientsPopupOpen(true)}
          className="manage-addons"
        />
      </div>
      <section className="clients-list flex-column g-05 width-max  service">
        {clients.map((client, index) => (
          <div key={index} className="addon-item width-max flex align-items-center">
            <span className="addon-item-name width-75 ml-1">{client.firstName + " " + client.lastName}</span>
          </div>
        ))}
      </section>
      {isManageClientsPopupOpen && (
        <ChooseClientsPopup
          onClose={() => setIsManageClientsPopupOpen(false)}
          handleSelectClients={handleToggleClient}
          selectedClients={tempClients}
          onSave={handleSaveClients}
          /* className="select-addons" */
        />
      )}
    </div>
  );
}

export default DisplayClientsList;
