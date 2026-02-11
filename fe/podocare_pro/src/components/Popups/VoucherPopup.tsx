import { Client } from "../../models/client";
import { useState, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import { validateVoucherForm } from "../../utils/validators";
import { NewVoucher, Voucher } from "../../models/voucher";
import { Action } from "../../models/action";
import VoucherService from "../../services/VoucherService";
import VoucherForm from "../Clients/VoucherForm";
import ClientService from "../../services/ClientService";

export interface VoucherPopupProps {
  onClose: () => void;
  voucherId?: string | number;
  className?: string;
  action: Action;
}

export function VoucherPopup({
  onClose,
  voucherId,
  className = "",
  action = Action.CREATE,
}: VoucherPopupProps) {
  const [voucherDTO, setVoucherDTO] = useState<NewVoucher>({
    value: 0,
    client: undefined,
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: null,
  });
  const [fetchedVoucher, setFetchedVoucher] = useState<Voucher | null>(null);
  const { showAlert } = useAlert(); 

  const fetchVoucherById = async () => {
    if (voucherId) {
      VoucherService.getVoucherById(voucherId)
        .then((data) => {
          setFetchedVoucher(data);
          if(action === Action.EDIT) {
            setVoucherDTO({
              value: data.value,
              client: data.client,
              issueDate: data.issueDate,
              expiryDate: data.expiryDate
            })
          }
        })
        .catch((error) => {
          setFetchedVoucher(null);
          showAlert("Błąd", AlertType.ERROR);
          console.error("Error fetching Voucher by voucherId.", error);
        });
    }
  };

  const handleVoucherAction = useCallback(async () => {
    const error = validateVoucherForm(voucherDTO, action, fetchedVoucher);
    if (error) {
      showAlert(error, AlertType.ERROR);
      return;
    }
    try {
      if (action === Action.CREATE) {
        await VoucherService.createVoucher(voucherDTO as NewVoucher);
        showAlert(
          `Voucher klienta ${
            voucherDTO.client?.firstName + " " + voucherDTO.client?.lastName
          } utworzony!`,
          AlertType.SUCCESS
        );
      } else if (action === Action.EDIT && fetchedVoucher) {
        await VoucherService.updateVoucher(
          fetchedVoucher.id,
          voucherDTO as NewVoucher
        );
        showAlert(`Voucher zaktualizowany!`, AlertType.SUCCESS);
      }
      onClose();
    } catch (error) {
      showAlert(
        `Błąd ${
          action === Action.CREATE ? "tworzenia" : "aktualizacji"
        } vouchera!`,
        AlertType.ERROR
      );
    }
  }, [voucherDTO, showAlert, fetchedVoucher, action]);

  useEffect(() => {
    if (voucherId) {
      fetchVoucherById();
    }
  }, []);

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
        className="voucher-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2">
          <h2 className="popup-title">
            {action === Action.CREATE ? "Nowy Voucher" : action === Action.EDIT ? "Edytuj Voucher" : "Podgląd Vouchera"}
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
          <VoucherForm
            voucherDTO={action === Action.DISPLAY && fetchedVoucher ? fetchedVoucher as Voucher : voucherDTO}
            setVoucherDTO={setVoucherDTO}
            action={action}
            voucherId={fetchedVoucher?.id ?? null}
          />
        </section>

        {action != Action.DISPLAY && (
          <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={handleVoucherAction}
        />
        )}
      </div>
    </div>,
    portalRoot
  );
}

export default VoucherPopup;
