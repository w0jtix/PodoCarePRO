import { useEffect, useState, useCallback } from "react";
import { useAlert } from "../Alert/AlertProvider";
import ActionButton from "../ActionButton";
import ReactDOM from "react-dom";
import ListHeader from "../ListHeader";
import { Client } from "../../models/client";
import RemovePopup from "./RemovePopup";
import { AlertType } from "../../models/alert";
import VoucherService from "../../services/VoucherService";
import { Voucher, NewVoucher, VoucherStatus, VoucherFilterDTO } from "../../models/voucher";
import { VOUCHERS_LIST_ATTRIBUTES } from "../../constants/list-headers";
import VouchersList from "../Clients/VouchersList";
import VoucherPopup from "./VoucherPopup";
import SearchBar from "../SearchBar";
import { Action } from "../../models/action";

export interface VoucherManagePopupProps {
  onClose: () => void;
  onReset: () => void;
  clients: Client[];
  className?: string;
}

export function VoucherManagePopup({
  onClose,
  onReset,
  clients,
  className = "",
}: VoucherManagePopupProps) {
  const [isAddNewVoucherPopupOpen, setIsAddNewVoucherPopupOpen] =
    useState<boolean>(false);
  const [editVoucherId, setEditVoucherId] =
    useState<string | number | null>(null);
  const [removeVoucherId, setRemoveVoucherId] = useState<string | number | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filter, setFilter] = useState<VoucherFilterDTO>({
    status: null,
    keyword: ""
  });
  const { showAlert } = useAlert();

  const fetchVouchers = async (): Promise<void> => {
    VoucherService.getVouchers(filter)
      .then((data) => {
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.issueDate);
          const dateB = new Date(b.issueDate);
          return dateB.getTime() - dateA.getTime();
        });
        console.log("sorted", sortedData)
        setVouchers(sortedData);
      })
      .catch((error) => {
        setVouchers([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching Vouchers: ", error);
      });
  };

  const handleKeywordChange = useCallback((newKeyword: string) => {
    setFilter((prev) => ({
      ...prev,
      keyword: newKeyword,
    }));
  }, []);

  const handleVoucherRemove = useCallback(async (): Promise<void> => {
    try {
      if (removeVoucherId != null) {
        await VoucherService.deleteVoucher(removeVoucherId);
        showAlert("Pomyślnie usunięto voucher!", AlertType.SUCCESS);
        setRemoveVoucherId(null);
        fetchVouchers();
        onReset();
      }
    } catch (error) {
      showAlert("Błąd usuwania vouchera!", AlertType.ERROR);
    }
  }, [removeVoucherId]);

  const toggleStatus = () => {
    setFilter((prev) => {
    let nextStatus: VoucherStatus | null = null;

    if (prev.status === null) nextStatus = VoucherStatus.ACTIVE;
    else if (prev.status === VoucherStatus.ACTIVE) nextStatus = VoucherStatus.USED;
    else if (prev.status === VoucherStatus.USED) nextStatus = VoucherStatus.EXPIRED;
    else nextStatus = null;

    return { ...prev, status: nextStatus };
  });
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [filter]);

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
        className="debt-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-1">
          <h2 className="popup-title">Zarządzaj Voucherami</h2>
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
        <section className="flex width-90 space-between mb-1 g-2">
          <ActionButton
            src={"src/assets/filter_icon.svg"}
            alt={"Status"}
            text={`Status: ${
              filter.status === null
                ? "wszystkie"
                : filter.status === VoucherStatus.ACTIVE
                ? "aktywne"
                : filter.status === VoucherStatus.USED
                ? "zrealizowane"
                : "nieaktywne"
            }`}
            onClick={toggleStatus}
            className={`${
              filter.status === null
                ? "wszystkie"
                : filter.status === VoucherStatus.ACTIVE
                ? "active"
                : filter.status === VoucherStatus.USED
                ? "used"
                : "expired"
            }`}
          />
          <SearchBar
            onKeywordChange={handleKeywordChange}
          />  
          <ActionButton
            src={"src/assets/addNew.svg"}
            alt={"Nowy Voucher"}
            text={"Nowy Voucher"}
            onClick={() => setIsAddNewVoucherPopupOpen(true)}
          />
        </section>
        <ListHeader attributes={VOUCHERS_LIST_ATTRIBUTES} />
        <VouchersList
          attributes={VOUCHERS_LIST_ATTRIBUTES}
          items={vouchers}
          className="products popup-list"
          setEditVoucherId={setEditVoucherId}
          setRemoveVoucherId={setRemoveVoucherId}
        />
        <span className="popup-category-description flex justify-center width-max flex-grow align-items-end">
          Voucher zakupiony podczas Wizyty może być usunięty tylko z Wizytą!
        </span>
      </div>

      {isAddNewVoucherPopupOpen && (
        <VoucherPopup
          onClose={() => {
            setIsAddNewVoucherPopupOpen(false);
            fetchVouchers();
            onReset();
          }}
          action={Action.CREATE}
          className=""
        />
      )}
      {editVoucherId != null && (
        <VoucherPopup
          onClose={() => {
            setEditVoucherId(null);
            fetchVouchers();
            onReset();
          }}
          voucherId={editVoucherId}
          action={Action.EDIT}
          className=""
        />
      )}
      {removeVoucherId != null && (
        <RemovePopup
          onClose={() => {
            setRemoveVoucherId(null);
          }}
          className=""
          handleRemove={handleVoucherRemove}
          warningText={
            "Zatwierdzenie spowoduje usunięcie Voucheru z bazy danych!"
          }
        />
      )}
    </div>,
    portalRoot
  );
}

export default VoucherManagePopup;
