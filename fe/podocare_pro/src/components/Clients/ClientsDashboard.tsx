import { useAlert } from "../Alert/AlertProvider";
import { useState, useEffect, useCallback } from "react";
import { AlertType } from "../../models/alert";
import ActionButton from "../ActionButton";
import NavigationBar from "../NavigationBar";
import { Client, ClientFilterDTO } from "../../models/client";
import ListHeader from "../ListHeader";
import { CLIENTS_LIST_ATTRIBUTES } from "../../constants/list-headers";
import ClientService from "../../services/ClientService";
import ClientPopup from "../Popups/ClientPopup";
import RemovePopup from "../Popups/RemovePopup";
import ClientsList from "./ClientsList";
import DebtManagePopup from "../Popups/DebtManagePopup";
import VoucherManagePopup from "../Popups/VoucherManagePopup";
import ReviewManagePopup from "../Popups/ReviewManagePopup";
import DiscountManagePopup from "../Popups/DiscountManagePopup";

export function ClientsDashboard() {
  const [resetTriggered, setResetTriggered] = useState<boolean>(false);
  const [removeClientId, setRemoveClientId] = useState<string | number | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [filter, setFilter] = useState<ClientFilterDTO>({
    keyword: "",
    boostClient: null,
    signedRegulations: null,
    hasDebts: null,
  });
  const [isAddNewClientPopupOpen, setIsAddNewClientPopupOpen] =
    useState<boolean>(false);
  const [isManageDebtsPopupOpen, setIsManageDebtsPopupOpen] =
    useState<boolean>(false);
  const [isManageVouchersPopupOpen, setIsManageVouchersPopupOpen] =
    useState<boolean>(false);
  const [isManageReviewsPopupOpen, setIsManageReviewsPopupOpen] =
    useState<boolean>(false);
  const [isManageDiscountsPopupOpen, setIsManageDiscountsPopupOpen] =
    useState<boolean>(false);
  const { showAlert } = useAlert();

  const fetchClients = async (): Promise<void> => {
    ClientService.getClients(filter)
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

  const handleKeywordChange = useCallback((newKeyword: string) => {
    setFilter((prev) => ({
      ...prev,
      keyword: newKeyword,
    }));
  }, []);

  const handleResetFiltersAndData = useCallback(() => {
    setResetTriggered((prev) => !prev);
    setSelectedClientId(null);
    setRemoveClientId(null);
    setFilter({
      keyword: "",
      boostClient: null,
      signedRegulations: null,
      hasDebts: null,
    });
  }, []);

  const handlePopupSuccess = useCallback(
    (message: string) => {
      showAlert(message, AlertType.SUCCESS);
      handleResetFiltersAndData();
    },
    [showAlert, handleResetFiltersAndData]
  );

  const handleBoost = useCallback(() => {
    setFilter((prev) => ({
      ...prev,
      boostClient: prev.boostClient === true ? null : true,
    }));
  }, []);

  const handleTerms = useCallback(() => {
    setFilter((prev) => ({
      ...prev,
      signedRegulations: prev.signedRegulations === false ? null : false,
    }));
  }, []);

  const handleDebt = useCallback(() => {
    setFilter((prev) => ({
      ...prev,
      hasDebts: prev.hasDebts === true ? null : true,
    }));
  }, []);

  const handleClientRemove = useCallback(async () => {
    if (!removeClientId) return;

    const selectedClient = clients.find((client) => client.id === removeClientId);
    if (!selectedClient) {
      showAlert("Nie znaleziono klienta.", AlertType.ERROR);
      return;
    }

    ClientService.deleteClient(removeClientId)
      .then(() => {
        handlePopupSuccess(
          `Klient ${
            selectedClient.firstName + " " + selectedClient.lastName
          } usunięty!`
        );
        setRemoveClientId(null);
      })
      .catch((error) => {
        console.error("Error removing Client", error);
        showAlert("Błąd usuwania klienta.", AlertType.ERROR);
      });
  }, [showAlert, removeClientId, clients, handlePopupSuccess]);

  const handleReset = useCallback(() => {
    setRemoveClientId(null);
    setSelectedClientId(null);
    fetchClients();
    handleResetFiltersAndData();
  }, []);

  useEffect(() => {
    fetchClients();
  }, [resetTriggered, filter]);
  return (
    <div className="dashboard-panel width-85 height-max flex-column align-items-center">
      <NavigationBar
        onKeywordChange={handleKeywordChange}
        resetTriggered={resetTriggered}
      >
        <div className="flex g-4 width-fit-content">
          <ActionButton
            src={"src/assets/boost.svg"}
            alt={"Boost"}
            text={"Boost"}
            onClick={handleBoost}
            className={`${filter.boostClient ? "cb-selected" : ""}`}
          />
          <ActionButton
            src={"src/assets/warning.svg"}
            alt={"Brak Regulaminu"}
            text={"Brak Regulaminu"}
            onClick={handleTerms}
            className={`${
              filter.signedRegulations == false ? "cr-selected" : ""
            }`}
          />
          <ActionButton
            src={"src/assets/debt.svg"}
            alt={"Klienci Zadłużeni"}
            text={"Posiadający Dług"}
            onClick={handleDebt}
            className={`${filter.hasDebts ? "cd-selected" : ""}`}
          />
        </div>
        <ActionButton
          src={"src/assets/reset.svg"}
          alt={"Reset filters"}
          iconTitle={"Resetuj filtry"}
          text={"Reset"}
          onClick={handleReset}
          disableText={true}
        />
      </NavigationBar>
      <section className="products-action-buttons width-80 flex align-self-center space-between mt-1 mb-1">
        <ActionButton
          src={"src/assets/addNew.svg"}
          alt={"Nowy Klient"}
          text={"Nowy Klient"}
          onClick={() => setIsAddNewClientPopupOpen(true)}
        />
        <div className="flex g-25">
          <ActionButton
            src={"src/assets/star.svg"}
            alt={"Opinie"}
            text={"Opinie"}
            onClick={() => setIsManageReviewsPopupOpen(true)}
          />
          <ActionButton
            src={"src/assets/voucher.svg"}
            alt={"Vouchery"}
            text={"Vouchery"}
            onClick={() => setIsManageVouchersPopupOpen(true)}
          />
          <ActionButton
            src={"src/assets/debt.svg"}
            alt={"Zadłużenia"}
            text={"Zadłużenia"}
            onClick={() => setIsManageDebtsPopupOpen(true)}
          />

          <ActionButton
            src={"src/assets/client_discount.svg"}
            alt={"Rabaty Klientów"}
            text={"Rabaty Klientów"}
            onClick={() => setIsManageDiscountsPopupOpen(true)}
          />
        </div>
      </section>
      <ListHeader attributes={CLIENTS_LIST_ATTRIBUTES} />
      <ClientsList
        attributes={CLIENTS_LIST_ATTRIBUTES}
        items={clients}
        setRemoveClientId={setRemoveClientId}
        setSelectedClientId={setSelectedClientId}
        className="services client-dashboard"
      />
      {isAddNewClientPopupOpen && (
        <ClientPopup
          onClose={() => {
            setIsAddNewClientPopupOpen(false);
            setSelectedClientId(null);
          }}
          onReset={handleReset}
          className={"client-popup"}
        />
      )}
      {selectedClientId != null && (
        <ClientPopup
          onClose={() => setSelectedClientId(null)}
          onReset={handleReset}
          selectedClientId={selectedClientId}
          className={"client-popup"}
        />
      )}
      {removeClientId != null && (
        <RemovePopup
          onClose={() => setRemoveClientId(null)}
          warningText={
            "Zatwierdzenie spowoduje usunięcie Klienta z bazy danych!"
          }
          handleRemove={handleClientRemove}
        />
      )}
      {isManageDebtsPopupOpen && (
        <DebtManagePopup
          onClose={() => {
            setIsManageDebtsPopupOpen(false);
          }}
          onReset={handleReset}
          clients={clients}
          className={""}
        />
      )}
      {isManageVouchersPopupOpen && (
        <VoucherManagePopup
          onClose={() => {
            setIsManageVouchersPopupOpen(false);
          }}
          onReset={handleReset}
          clients={clients}
          className={""}
        />
      )}
      {isManageReviewsPopupOpen && (
        <ReviewManagePopup
          onClose={() => {
            setIsManageReviewsPopupOpen(false);
          }}
          onReset={handleReset}
          clients={clients}
          className={""}
        />
      )}
      {isManageDiscountsPopupOpen && (
        <DiscountManagePopup
          onClose={() => {
            setIsManageDiscountsPopupOpen(false);
          }}
          onReset={handleReset}
          className={""}
        />
      )}
    </div>
  );
}
export default ClientsDashboard;
