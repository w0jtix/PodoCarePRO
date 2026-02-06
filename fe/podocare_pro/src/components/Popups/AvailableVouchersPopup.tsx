import { useCallback, useEffect, useState } from "react";
import { Voucher, VoucherStatus } from "../../models/voucher";
import VoucherService from "../../services/VoucherService";
import ReactDOM from "react-dom";
import { VOUCHERS_VISIT_LIST_ATTRIBUTES } from "../../constants/list-headers";
import ListHeader from "../ListHeader";
import VouchersList from "../Clients/VouchersList";
import ActionButton from "../ActionButton";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";

export interface AvailableVouchersPopupProps {
  onClose: () => void;
  className?: string;
  onSave: (voucher: Voucher | null) => void;
  attachedVoucher: Voucher | null;
}

export function AvailableVouchersPopup({
  onClose,
  className = "",
  onSave,
  attachedVoucher,
}: AvailableVouchersPopupProps) {
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [expiredVouchers, setExpiredVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const { showAlert } = useAlert();

  const fetchAvailableVouchers = async (): Promise<void> => {
    VoucherService.getVouchers({ status: VoucherStatus.ACTIVE })
      .then((data) => {
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.issueDate);
          const dateB = new Date(b.issueDate);
          return dateB.getTime() - dateA.getTime();
        });
        setAvailableVouchers(sortedData);
      })
      .catch((error) => {
        setAvailableVouchers([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching active Vouchers: ", error);
      });
  };
  const fetchExpiredVouchers = async (): Promise<void> => {
    VoucherService.getVouchers({ status: VoucherStatus.EXPIRED })
      .then((data) => {
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.issueDate);
          const dateB = new Date(b.issueDate);
          return dateB.getTime() - dateA.getTime();
        });
        setExpiredVouchers(sortedData);
      })
      .catch((error) => {
        setExpiredVouchers([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching expired Vouchers: ", error);
      });
  };
  const handleVoucherSelection = useCallback(
    (selection: Voucher | null) => {
      if (selection) {
        if (selectedVoucher?.id === selection.id) {
          setSelectedVoucher(null);
        } else {
          setSelectedVoucher(selection);
        }
      }
    },
    [selectedVoucher]
  );

  useEffect(() => {
    fetchAvailableVouchers();
    fetchExpiredVouchers();
    setSelectedVoucher(attachedVoucher);
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
        className="voucher-select-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-1">
          <h2 className="popup-title">Przypisz Voucher do Płatności</h2>
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

        <ListHeader attributes={VOUCHERS_VISIT_LIST_ATTRIBUTES} />
        <VouchersList
          attributes={VOUCHERS_VISIT_LIST_ATTRIBUTES}
          items={availableVouchers}
          expiredVouchers={expiredVouchers}
          className={`products popup-list ${className} vouchers`}
          setSelectedVoucher={(selected) => handleVoucherSelection(selected)}
          selectedVoucher={selectedVoucher}
        />

        <div className="mt-1 flex width-max align-items-end justify-center f-1 ">
          <ActionButton
            src={"src/assets/tick.svg"}
            alt={"Zapisz"}
            text={"Zapisz"}
            onClick={() => onSave(selectedVoucher)}
          />
        </div>
      </div>
    </div>,
    portalRoot
  );
}

export default AvailableVouchersPopup;
