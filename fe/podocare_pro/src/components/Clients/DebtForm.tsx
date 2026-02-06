import { Action } from "../../models/action";
import { useState, useEffect, useCallback } from "react";
import { NewClient, Client } from "../../models/client";
import TextInput from "../TextInput";
import { DebtType, NewClientDebt } from "../../models/debt";
import DropdownSelect from "../DropdownSelect";
import CostInput from "../CostInput";
import ActionButton from "../ActionButton";

export interface DebtFormProps {
  debtDTO: NewClientDebt;
  setDebtDTO: React.Dispatch<React.SetStateAction<NewClientDebt>>;
  clients: Client[];
  className?: string;
  action: Action;
}

export function DebtForm({
  debtDTO,
  setDebtDTO,
  clients,
  className = "",
  action
}: DebtFormProps) {
  const clientItems = clients.map((client) => ({
    name: `${client.firstName} ${client.lastName}`,
    ...client,
  }));
  const handleClientChange = useCallback((client: Client | Client[] | null) => {
    const selectedClient = Array.isArray(client) ? client[0] : client;

    setDebtDTO((prev) => ({
      ...prev,
      client: selectedClient ?? undefined,
    }));
  }, []);

  const handleDebtTypeChange = useCallback((type: DebtType) => {
    setDebtDTO((prev) => ({
      ...prev,
      type: type,
    }));
  }, []);

  const handleValueChange = useCallback((value: number) => {
    setDebtDTO((prev) => ({
      ...prev,
      value: value,
    }));
  }, []);

  useEffect(() => {
    if(action === Action.CREATE) {
      setDebtDTO((prev) => ({
      ...prev,
      createdAt: new Date().toISOString().split("T")[0],
    }));
    }
  }, []);

  return (
    <div
      className={`custom-form-container flex-column width-max g-05 ${className}`}
    >
      <section className="flex width-max align-items-center mb-1 space-between">
        <span className="input-label">Wybierz powód:</span>
        <div className= "flex g-4">
        <ActionButton
          disableImg ={true}
          text={"Nieobecność"}
          
          onClick={() => handleDebtTypeChange(DebtType.ABSENCE_FEE)}
          className={`${debtDTO.type === DebtType.ABSENCE_FEE ? "ca-selected" : ""}`}
        />
        <ActionButton
            disableImg ={true}
          text={"Niezapłacone usługi/ produkty"}
          onClick={() => handleDebtTypeChange(DebtType.UNPAID)}
          className={`${debtDTO.type === DebtType.UNPAID ? "cd-selected" : ""}`}
        />
        </div>
      </section>
      <section className="form-row flex width-max align-items-center space-between">
        <span className="input-label">Klient:</span>
        <DropdownSelect
          items={clients}
          placeholder="Wybierz Klienta"
          value={debtDTO.client}
          getItemLabel={(c) => `${c.firstName} ${c.lastName}`}
          allowNew={false}
          onChange={handleClientChange}
          className="clients"
        />
      </section>
      <section className="form-row flex width-max align-items-center space-between">
        <span className="input-label">Wartość:</span>
        <CostInput onChange={handleValueChange} className="thin" 
        selectedCost={debtDTO.value ?? 0}
        />
      </section>
    </div>
  );
}

export default DebtForm;
