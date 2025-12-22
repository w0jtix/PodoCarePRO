import { Action } from "../../models/action";
import { useState, useEffect, useCallback } from "react";
import { NewClient, Client } from "../../models/client";
import TextInput from "../TextInput";
import { DebtType, NewClientDebt } from "../../models/debt";
import DropdownSelect from "../DropdownSelect";
import CostInput from "../CostInput";
import ActionButton from "../ActionButton";
import { NewVoucher } from "../../models/voucher";
import DateInput from "../DateInput";
import VoucherService from "../../services/VoucherService";
import { NewDiscount } from "../../models/visit";
import DigitInput from "../DigitInput";
import ClientService from "../../services/ClientService";
import DisplayClientsList from "./DisplayClientsList";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";

export interface DiscountFormProps {
  selectedDiscountId?: number;
  discountDTO: NewDiscount;
  setDiscountDTO: React.Dispatch<React.SetStateAction<NewDiscount>>;
  className?: string;
  action: Action;
}

export function DiscountForm({
  selectedDiscountId,
  discountDTO,
  setDiscountDTO,
  className = "",
  action,
}: DiscountFormProps) {
  const { showAlert } = useAlert();

  const fetchClientsByDiscountId = async (): Promise<void> => {
    ClientService.getClients({ discountId: selectedDiscountId })
      .then((data) => {
        const sortedClients = [...data].sort((a, b) =>
          a.firstName.localeCompare(b.firstName, "pl", { sensitivity: "base" })
        );
        setDiscountDTO((prev) => ({
          ...prev,
          clients: sortedClients,
        }));
      })
      .catch((error) => {
        setDiscountDTO((prev) => ({
          ...prev,
          clients: [],
        }));
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching Clients: ", error);
      });
  };

  const handleClientsChange = useCallback((selected: Client[]) => {
    setDiscountDTO((prev) => ({
      ...prev,
      clients: selected,
    }));
  }, []);
  const handleNameChange = useCallback((name: string) => {
    setDiscountDTO((prev) => ({
      ...prev,
      name: name,
    }));
  }, []);
  const handlePercentageValueChange = useCallback((value: number | null) => {
    setDiscountDTO((prev) => ({
      ...prev,
      percentageValue: value ?? 0,
    }));
  }, []);

  useEffect(() => {
    if (selectedDiscountId) fetchClientsByDiscountId();
  }, []);

  return (
    <div
      className={`custom-form-container flex-column width-max g-05 ${className}`}
    >
      <section className="form-row flex width-max align-items-center space-between">
        <span className="input-label">Nazwa:</span>
        <TextInput
          dropdown={false}
          value={discountDTO.name}
          placeholder="Max 6 znaków"
          onSelect={(inputName) => {
            if (typeof inputName === "string") {
              handleNameChange(inputName);
            }
          }}
          className={"name"}
          maxLength={6}
        />
      </section>
      <section className="form-row flex width-max align-items-center space-between">
        <span className="input-label">Wartość Rabatu [%]:</span>
        <DigitInput
          onChange={handlePercentageValueChange}
          value={discountDTO.percentageValue}
          max={100}
          placeholder={"0"}
        />
      </section>
      <DisplayClientsList
        clients={discountDTO.clients ?? []}
        onClientsChange={handleClientsChange}
      />
      <span className="popup-category-description flex justify-center width-max flex-grow align-items-end">
        UWAGA: Klient może mieć przypisaną maksymalnie 1 zniżkę. Przypisanie
        Klienta do nowej zniżki zastąpi poprzednią.
      </span>
    </div>
  );
}

export default DiscountForm;
