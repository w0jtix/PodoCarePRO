import { Action } from "../../models/action";
import { useState, useEffect, useCallback } from "react";
import { NewClient, Client } from "../../models/client";
import TextInput from "../TextInput";
import DropdownSelect from "../DropdownSelect";
import CostInput from "../CostInput";
import ActionButton from "../ActionButton";
import { Review, NewReview, ReviewSource } from "../../models/review";
import DateInput from "../DateInput";

export interface ReviewFormProps {
  reviewDTO: NewReview;
  setReviewDTO: React.Dispatch<React.SetStateAction<NewReview>>;
  clients: Client[];
  className?: string;
  action: Action;
}

export function ReviewForm({
  reviewDTO,
  setReviewDTO,
  clients,
  className = "",
  action,
}: ReviewFormProps) {
  const clientItems = clients.map((client) => ({
    name: `${client.firstName} ${client.lastName}`,
    ...client,
  }));
  const handleClientChange = useCallback((client: Client | Client[] | null) => {
    const selectedClient = Array.isArray(client) ? client[0] : client;

    setReviewDTO((prev) => ({
      ...prev,
      client: selectedClient ?? null,
    }));
  }, []);

  const handleReviewSourceChange = useCallback((source: ReviewSource) => {
    setReviewDTO((prev) => ({
      ...prev,
      source: source,
    }));
  }, []);

  const handleIssueDateChange = useCallback((newDate: string | null) => {
    setReviewDTO((prev) => ({
      ...prev,
      issueDate: newDate || new Date().toISOString(),
    }));
  }, []);

  useEffect(() => {
    if (action === Action.CREATE) {
      setReviewDTO((prev) => ({
        ...prev,
        createdAt: new Date().toISOString().split("T")[0],
      }));
    }
  }, []);

  return (
    <div
      className={`custom-form-container flex-column width-max g-05 ${className}`}
    >
      <section className="flex width-max align-items-center space-between">
        <span className="input-label">Wybierz źródło:</span>
        <div className="flex g-4">
          {Object.values(ReviewSource).map((source) => (
            <ActionButton
              key={source}
              src={`src/assets/${source.toLowerCase()}.png`}
              alt={source}
              text={source === ReviewSource.GOOGLE ? "Google" : "Booksy"}
              onClick={() => handleReviewSourceChange(source)}
              className={`review-source ${source.toLowerCase()} ${reviewDTO.source === source ? "selected" : ""}`}
            />
          ))}
        </div>
      </section>
      <section className="form-row flex width-max align-items-center space-between">
        <span className="input-label">Klient:</span>
        <DropdownSelect
          items={clients}
          placeholder="Wybierz Klienta"
          value={reviewDTO.client}
          getItemLabel={(c) => `${c.firstName} ${c.lastName}`}
          allowNew={false}
          onChange={handleClientChange}
          className="clients"
        />
      </section>
      <section className="form-row flex width-max align-items-center space-between">
        <span className="input-label">Data dodania opinii:</span>
        <DateInput
          onChange={handleIssueDateChange}
          selectedDate={reviewDTO.issueDate ?? new Date()}
        />
      </section>
    </div>
  );
}

export default ReviewForm;
