import { Action } from "../../models/action";
import { useState, useEffect, useCallback } from "react";
import { NewClient, Client } from "../../models/client";
import TextInput from "../TextInput";
import { DebtType, NewClientDebt } from "../../models/debt";
import DropdownSelect from "../DropdownSelect";
import CostInput from "../CostInput";
import ActionButton from "../ActionButton";
import { NewVoucher, Voucher } from "../../models/voucher";
import DateInput from "../DateInput";
import VoucherService from "../../services/VoucherService";
import ClientService from "../../services/ClientService";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";

export interface VoucherFormProps {
  voucherDTO: NewVoucher | Voucher;
  setVoucherDTO: React.Dispatch<React.SetStateAction<NewVoucher>>;
  className?: string;
  action: Action;
  voucherId?: string | number | null;
}

export function VoucherForm({
  voucherDTO,
  setVoucherDTO,
  className = "",
  action,
  voucherId,
}: VoucherFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [voucherHasSaleReference, setVoucherHasSaleReference] = useState<Boolean> (false);
  const { showAlert } = useAlert();

  const fetchClients = async (): Promise<void> => {
    ClientService.getClients()
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

  const checkForReference = async () => {
    if (action === Action.EDIT && voucherId) {
        try {
          const hasReference = await VoucherService.hasSaleReference(voucherId);
          setVoucherHasSaleReference(hasReference);
        } catch (error) {
          showAlert("Błąd", AlertType.ERROR);
          console.error("Error checking reference:", error);
          setVoucherHasSaleReference(false);
        }
  } else {
    setVoucherHasSaleReference(false);
  }
  }

  const handleClientChange = useCallback((client: Client | Client[] | null) => {
    const selectedClient = Array.isArray(client) ? client[0] : client;

    setVoucherDTO((prev) => ({
      ...prev,
      client: selectedClient ?? undefined,
    }));
  }, []);

  const handleIssueDateChange = useCallback((newDate: string | null) => {
    setVoucherDTO((prev) => ({
      ...prev,
      issueDate: newDate || new Date().toISOString(),
    }));
  }, []);

  const handleExpiryDateChange = useCallback((newDate: string | null) => {
    setVoucherDTO((prev) => ({
      ...prev,
      expiryDate: newDate || new Date().toISOString(),
    }));
  }, []);

  const handleValueChange = useCallback((value: number) => {
    setVoucherDTO((prev) => ({
      ...prev,
      value: value,
    }));
  }, []);

  useEffect(() => {
    if(action != Action.DISPLAY) {
      fetchClients();
      checkForReference();
    }
  }, [voucherId])

  return (
    <div
      className={`custom-form-container flex-column width-max g-05 ${className}`}
    >
      {!voucherHasSaleReference && (
      <section className="form-row flex width-max align-items-center space-between">
        <span className="input-label">Klient:</span>
        <DropdownSelect
          items={clients}
          placeholder="Wybierz Klienta"
          value={voucherDTO.client}
          getItemLabel={(c) => `${c.firstName} ${c.lastName}`}
          allowNew={false}
          onChange={handleClientChange}
          className="clients"
          disabled={action == Action.DISPLAY}
        />
      </section>
      )}
      {!voucherHasSaleReference && (
        <section className="form-row flex width-max align-items-center space-between">
            <span className="input-label">Data zakupu:</span>
          <DateInput
            onChange={handleIssueDateChange}
            selectedDate={voucherDTO.issueDate ?? new Date()}
          />
        </section>
      )}
      {action === Action.EDIT && (
        <section className="form-row flex width-max align-items-center space-between">
            <span className="input-label">Ważny do:</span>
          <DateInput
            onChange={handleExpiryDateChange}
            selectedDate={voucherDTO.expiryDate}
          />
        </section>
      )}
      <section className="form-row flex width-max align-items-center space-between">
        <span className="input-label">Wartość:</span>
        <CostInput
          onChange={handleValueChange}
          className="thin"
          selectedCost={voucherDTO.value ?? 0}
          disabled={action == Action.DISPLAY}
        />
      </section>
      {(action === Action.EDIT && !voucherHasSaleReference) && (
        <span className="popup-category-description flex justify-center width-max flex-grow align-items-end">
          Podczas edycji Vouchera zarządzasz datami osobno!
        </span>
      )}
    </div>
  );
}

export default VoucherForm;
