import React, { useCallback, useState } from "react";
import ActionButton from "../ActionButton";
import { ListAttribute } from "../../constants/list-headers";
import { Voucher, VoucherStatus } from "../../models/voucher";
import VisitPopup from "../Popups/VisitPopup";

export interface VouchersListProps {
  attributes: ListAttribute[];
  items: Voucher[];
  setEditVoucherId?: (voucherId: string | number | null) => void;
  setRemoveVoucherId?: (voucherId: string | number | null) => void;
  setSelectedVoucher?: (voucher: Voucher | null) => void;
  selectedVoucher?: Voucher | null;
  className?: string;
  onClick?: (voucher: Voucher) => void;
}

export function VouchersList({
  attributes,
  items,
  setEditVoucherId,
  setRemoveVoucherId,
  setSelectedVoucher,
  selectedVoucher,
  className = "",
  onClick,
}: VouchersListProps) {
  const [selectedVoucherIdForVisit,setSelectedVoucherIdForVisit] = useState<string | number| null>(null);
  const [previewVisitId, setPreviewVisitId] = useState<string | number | null>(null);

  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, item: Voucher) => {
      e.stopPropagation();
      setEditVoucherId?.(item.id);
    },
    [setEditVoucherId]
  );

  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, item: Voucher) => {
      e.stopPropagation();
      setRemoveVoucherId?.(item.id);
    },
    [setRemoveVoucherId]
  );

  const renderAttributeContent = (
    attr: ListAttribute,
    item: Voucher,
    index: number
  ): React.ReactNode => {
    switch (attr.name) {
      case "Status":
        return (
          <div
            onClick={item.status === VoucherStatus.USED ? () => setSelectedVoucherIdForVisit(item.id) : undefined}
            className={item.status === VoucherStatus.USED ? 'pointer' : 'default'}
          >
          
          <span
            className={`debt-list-span ${
              item.status === VoucherStatus.ACTIVE
                ? "active"
                : item.status === VoucherStatus.EXPIRED
                ? "expired"
                : "used"
            }`}
          >
            {item.status === VoucherStatus.ACTIVE
              ? "AKTYWNY"
              : item.status === VoucherStatus.EXPIRED
              ? "NIEAKTYWNY"
              : "ZREALIZOWANY"}
          </span>
          </div>
        );

      case " ":
        return (
          <img src={"src/assets/voucher.svg"} alt={"Voucher"} className="rv-voucher-icon"></img>
        )

      case "Klient":
        return `${item.client.firstName + " " + item.client.lastName}`;

      case "Ważny od":
        return new Date(item.issueDate).toLocaleDateString("pl-PL");

      case "Ważny do":
        return new Date(item.expiryDate).toLocaleDateString("pl-PL");

      case "Wartość":
        return `${item.value} zł`;

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons flex">
            {!item.purchaseVisitId && item.status !== VoucherStatus.USED  && (
              <>
              <ActionButton
              src="src/assets/edit.svg"
              alt="Edytuj Voucher"
              iconTitle={"Edytuj Voucher"}
              text="Edytuj"
              onClick={(e) => handleOnClickEdit(e, item)}
              disableText={true}
            />
            <ActionButton
              src="src/assets/cancel.svg"
              alt="Usuń Voucher"
              iconTitle={"Usuń Voucher"}
              text="Usuń"
              onClick={(e) => handleOnClickRemove(e, item)}
              disableText={true}
            />
            </>
            )}
            {item.purchaseVisitId && (
              <ActionButton
                src="src/assets/preview.svg"
                alt="Podgląd wizyty zakupu"
                iconTitle={"Podgląd Wizyty zakupu Vouchera"}
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewVisitId(item.purchaseVisitId!);
                }}
                disableText={true}
              />
            )}
          </div>
        );
    }
  };
  return (
    <div
      className={`item-list width-93 grid p-0 mt-05 ${
        items.length === 0 ? "border-none" : ""
      } ${className} `}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`product-wrapper ${className} ${
            selectedVoucher?.id === item.id ? "selected" : ""
          }`}
          onClick={() => setSelectedVoucher?.(item)}
        >
          <div
            className={`item align-items-center flex ${className} ${
              selectedVoucher?.id === item.id ? "selected" : ""
            }`}
          >
            {attributes.map((attr) => (
              <div
                key={`${item.id}-${attr.name}`}
                className={`attribute-item flex  ${className}`}
                style={{
                  width: attr.width,
                  justifyContent: attr.justify,
                }}
              >
                {renderAttributeContent(attr, item, index)}
              </div>
            ))}
          </div>
        </div>
      ))}
      {selectedVoucherIdForVisit !== null && (
              <VisitPopup
                onClose={() => setSelectedVoucherIdForVisit(null)}
                voucherId={selectedVoucherIdForVisit}
              />
            )}
      {previewVisitId && (
        <VisitPopup
          onClose={() => setPreviewVisitId(null)}
          visitId={previewVisitId}
        />
      )}
    </div>
  );
}
export default VouchersList;
