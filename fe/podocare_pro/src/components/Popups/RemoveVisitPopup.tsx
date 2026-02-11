import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import { Visit } from "../../models/visit";
import { SaleItem } from "../../models/sale";
import { useCallback, useState, useEffect } from "react";
import VisitService from "../../services/VisitService";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import VisitCartItemList from "../Visit/VisitCartItemList";
import {
  PRODUCT_VISIT_LIST_CONTENT_ATTRIBUTES,
  DEBTS_VISIT_LIST_ATTRIBUTES,
  VOUCHER_VISIT_LIST_CONTENT_ATTRIBUTES,
  VOUCHERS_AS_PAYMENT_LIST_ATTRIBUTES
} from "../../constants/list-headers";
import { ClientDebt } from "../../models/debt";
import DebtsList from "../Clients/DebtsList";
import { VoucherStatus } from "../../models/voucher";
import { PaymentStatus } from "../../models/payment";
import { formatDate } from "../../utils/dateUtils";
import VouchersList from "../Clients/VouchersList";
import { Voucher } from "../../models/voucher";


export interface RemoveVisitPopupProps {
  onClose: () => void;
  visitId: number | string;
  className?: string;
  handleResetFiltersAndData:() => void;
}

export function RemoveVisitPopup({
  onClose,
  visitId,
  className = "",
  handleResetFiltersAndData
}: RemoveVisitPopupProps) {
  const { showAlert } = useAlert();
  const [fetchedVisit, setFetchedVisit] = useState<Visit | null> (null);
  const [saleItemProducts, setSaleItemProducts] = useState<SaleItem[]>([]);
  const [saleItemVouchers, setSaleItemVouchers] = useState<SaleItem[]>([]);
  const [paidClientDebts, setPaidClientDebts] = useState<ClientDebt[]>([]);
  const [vouchersAsPayment, setVouchersAsPayment] = useState<Voucher[]>([]);
  const [visitWithDebtRedempted, setVisitWithDebtRedempted] =
    useState<Visit | null>(null);

  const voucherConflict =
    saleItemVouchers.length > 0 &&
    saleItemVouchers.some((v) => v.voucher?.status === VoucherStatus.USED);


  const fetchVisitById = async(visitId: number | string) => {
    VisitService.getVisitById(visitId)
      .then((data) => {
        setFetchedVisit(data);
      })
      .catch((error) => {
        console.error("Error fetching Visit: ", error);
        showAlert("Błąd!", AlertType.ERROR);
      })
  }

  const handleRemove = useCallback(async () => {
    VisitService.deleteVisit(visitId)
      .then((status) => {
        showAlert("Wizyta usunięta!", AlertType.SUCCESS);
        handleResetFiltersAndData();
        setTimeout(() => {
          onClose();
        }, 600);
      })
      .catch((error) => {
        console.error("Error removing Visit", error);
        showAlert("Błąd usuwania wizyty.", AlertType.ERROR);
      });
  }, [visitId, showAlert]);

  const handleDebtRedempted = async (visitId: string | number) => {
    VisitService.findVisitByDebtSourceVisitId(visitId)
      .then((data) => {
        setVisitWithDebtRedempted(data);
      })
      .catch((error) => {
        showAlert("Błąd", AlertType.ERROR);
        console.error(error);
        setVisitWithDebtRedempted(null);
      });
  };

  useEffect(() => {
    if (fetchedVisit && fetchedVisit.sale) {
      setSaleItemProducts(
        fetchedVisit.sale.items.filter((item) => item.product !== null)
      );
      setSaleItemVouchers(
        fetchedVisit.sale.items.filter((item) => item.voucher !== null)
      );
    }
    if (fetchedVisit && fetchedVisit.debtRedemptions.length > 0) {
      setPaidClientDebts(
        fetchedVisit.debtRedemptions.map(
          (debtRedemption) => debtRedemption.debtSource
        )
      );
    }
    if(fetchedVisit && fetchedVisit.payments.length > 0) {
      setVouchersAsPayment(
        fetchedVisit.payments
        .map(p => p.voucher)
        .filter((v) => v != null)
      )
    }
    if (fetchedVisit) {
      const statusPaid = fetchedVisit.paymentStatus === PaymentStatus.PAID;
      let totalPaid = 0;
      fetchedVisit.payments.map((payment) => (totalPaid += payment.amount));
      const debtFromPayment = totalPaid < fetchedVisit.totalValue;
      if (statusPaid && (fetchedVisit.absence || debtFromPayment)) {
        handleDebtRedempted(fetchedVisit.id);
      }
    }
  }, [fetchedVisit]);

  useEffect(() => {
    if(visitId) {
      fetchVisitById(visitId);
    }
  },[visitId])

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }

  if(!fetchedVisit) {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay flex justify-center align-items-start short-version ${className}`}
      onClick={onClose}
    >
      <div
        className="remove-product-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2">
          <h2 className="popup-title">Na pewno? ⚠️</h2>

          <button
            className="popup-close-button  transparent border-none flex align-items-center justify-center absolute pointer"
            onClick={onClose}
          >
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <span className="qv-span mb-2">
          ❗❗❗ Zatwierdzenie spowoduje usunięcie Wizyty.
        </span>

        <div className="rv-sections flex-column width-max align-items-center height-fit-content">
          {visitWithDebtRedempted && (
            <div className="flex width-fit-content g-5px mb-2">
              <img
                    src={"src/assets/warning.svg"}
                    alt="Warning"
                    className="visit-remove-warning-icon"
                  />
              <div className="flex-column align-items-center g-5px width-max">
              <span className="qv-span f12 warning">
                  {`Konflikt: ${fetchedVisit.absence ? 
                      "Nieobecność usuwanej Wizyty została spłacona podczas innej Wizyty: " 
                      : `Zadłużenie tej Wizyty z powodu niepełnej płatności zostało spłacone podczas Wizyty: ` 
                      }`}</span>
              <span className="qv-span f12 warning">
                  {`${formatDate(visitWithDebtRedempted.date)} ${visitWithDebtRedempted.client.firstName + " " + visitWithDebtRedempted.client.lastName}`}</span>
              </div>
          </div>
          )}
          {saleItemProducts.length > 0 && (
            <div className="width-80 flex-column g-1 mb-1">
              <span className="qv-span text-align-center">
                Poniższe produkty zostaną przywrócone do Magazynu:
              </span>
              <VisitCartItemList
                attributes={PRODUCT_VISIT_LIST_CONTENT_ATTRIBUTES}
                items={saleItemProducts}
                className="services pricelist qv content popup"
              />
            </div>
          )}
          {saleItemVouchers.length > 0 && (
            <div className="width-80 flex-column g-1 mb-1">
              <span className="qv-span text-align-center">
                Poniższe vouchery zostaną usunięte:
              </span>
              <VisitCartItemList
                attributes={VOUCHER_VISIT_LIST_CONTENT_ATTRIBUTES}
                items={saleItemVouchers}
                className="services pricelist qv content popup"
              />
              {voucherConflict && (
                <div className="width-80 flex g-05 mt-05 mb-05 align-items-center align-self-center">
                  <img
                    src={"src/assets/warning.svg"}
                    alt="Warning"
                    className="voucher-warning-icon"
                  />
                  <span className="qv-span f10 warning">
                    {" "}
                    Konflikt! Voucher został użyty jako forma płatności do innej
                    Wizyty.
                  </span>
                </div>
              )}
            </div>
          )}
          {paidClientDebts.length > 0 && (
            <div className="width-80 flex-column g-1 mb-1">
              <span className="qv-span text-align-center">
                Poniższe spłaty długów zostaną cofnięte:
              </span>
              <DebtsList
                attributes={DEBTS_VISIT_LIST_ATTRIBUTES}
                items={paidClientDebts}
                className="products popup-list quick-visit content popup"
              />
            </div>
          )}
          {vouchersAsPayment.length > 0 && (
            <div className="width-80 flex-column g-1 mb-1">
              <span className="qv-span text-align-center">
                Wizyta opłacona przez Voucher. <br/> Status Vouchera zostanie przywrócony zgodnie z datą ważności.
              </span>
              <VouchersList
                attributes={VOUCHERS_AS_PAYMENT_LIST_ATTRIBUTES}
                items={vouchersAsPayment}
                className={"products popup-list quick-visit content popup"}
              />
            </div>
          )}
        </div>
        <section className="footer-popup-action-buttons width-60 flex space-between mt-05 mb-05">
          <div className="footer-cancel-button">
            <ActionButton
              src={"src/assets/cancel.svg"}
              alt={"Anuluj"}
              text={"Anuluj"}
              onClick={onClose}
            />
          </div>
          <div className="footer-confirm-button">
            <ActionButton
              src={"src/assets/tick.svg"}
              alt={"Zatwierdź"}
              text={"Zatwierdź"}
              disabled={(voucherConflict || visitWithDebtRedempted !== null) ? true : false}
              onClick={handleRemove}
            />
          </div>
        </section>
      </div>
    </div>,
    portalRoot
  );
}

export default RemoveVisitPopup;
