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
import { DISCOUNTS_LIST_ATTRIBUTES, VOUCHERS_LIST_ATTRIBUTES } from "../../constants/list-headers";
import VouchersList from "../Clients/VouchersList";
import VoucherPopup from "./VoucherPopup";
import SearchBar from "../SearchBar";
import DiscountsList from "../Clients/DiscountsList";
import { Discount } from "../../models/visit";
import DiscountService from "../../services/DiscountService";
import DiscountPopup from "./DiscountPopup";

export interface DiscountManagePopupProps {
  onClose: () => void;
  onReset: () => void;
  className?: string;
}

export function DiscountManagePopup({
  onClose,
  onReset,
  className = "",
}: DiscountManagePopupProps) {
  const [isAddNewDiscountPopupOpen, setIsAddNewDiscountPopupOpen] =
    useState<boolean>(false);
  const [editDiscountId, setEditDiscountId] =
    useState<number | string | null>(null);
  const [removeDiscountId, setRemoveDiscountId] =
    useState<number | string | null>(null);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const { showAlert } = useAlert();

  const fetchDiscounts = async (): Promise<void> => {
    DiscountService.getDiscounts()
      .then((data) => {
        setDiscounts(data);
      })
      .catch((error) => {
        setDiscounts([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching Discounts: ", error);
      });
  };


  const handleDiscountRemove = useCallback(async (): Promise<void> => {
    try {
      if (removeDiscountId) {
        await DiscountService.deleteDiscount(removeDiscountId);
        showAlert("Pomyślnie usunięto rabat!", AlertType.SUCCESS);
        setRemoveDiscountId(null);
        fetchDiscounts();
        onReset();
      }
    } catch (error) {
      showAlert("Błąd usuwania rabatu!", AlertType.ERROR);
    }
  }, [removeDiscountId]);


  useEffect(() => {
    fetchDiscounts();
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
        className="discount-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-1">
          <h2 className="popup-title">Zarządzaj Rabatami Klientów</h2>
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
            src={"src/assets/addNew.svg"}
            alt={"Nowa Rabat"}
            text={"Nowa Rabat"}
            onClick={() => setIsAddNewDiscountPopupOpen(true)}
          />
        </section>
        <ListHeader attributes={DISCOUNTS_LIST_ATTRIBUTES} />
        <DiscountsList
          attributes={DISCOUNTS_LIST_ATTRIBUTES}
          items={discounts}
          className="products popup-list"
          setEditDiscountId={setEditDiscountId}
          setRemoveDiscountId={setRemoveDiscountId}
        />
      </div>

      {isAddNewDiscountPopupOpen && (
        <DiscountPopup
          onClose={() => {
            setIsAddNewDiscountPopupOpen(false);
            fetchDiscounts();
            onReset();
          }}
          className=""
        />
      )}
      {editDiscountId != null && (
        <DiscountPopup
          onClose={() => {
            setEditDiscountId(null);
            fetchDiscounts();
            onReset();
          }}
          className=""
          discountId={editDiscountId}
        />
      )}
      {removeDiscountId != null && (
        <RemovePopup
          onClose={() => {
            setRemoveDiscountId(null);
          }}
          className=""
          handleRemove={handleDiscountRemove}
          warningText={
            "Zatwierdzenie spowoduje odpięcie od przypisanych Klientów i usunięcie Zniżki!"
          }
        />
      )}
    </div>,
    portalRoot
  );
}

export default DiscountManagePopup;
