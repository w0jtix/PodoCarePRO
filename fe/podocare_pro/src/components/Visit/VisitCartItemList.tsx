import { useCallback, useEffect, useState } from "react";
import { ListAttribute } from "../../constants/list-headers";
import ActionButton from "../ActionButton";
import { NewVisitItem } from "../../models/visit";
import { NewSaleItem, SaleItem } from "../../models/sale";
import CostInput from "../CostInput";
import { Visit, VisitItem } from "../../models/visit";
import {
  SERVICES_DISCOUNTED_VISIT_ATTRIBUTES,
  SERVICES_VISIT_ATTRIBUTES,
  SERVICES_VISIT_CONTENT_ATTRIBUTES,
  SERVICES_BOOST_VISIT_CONTENT_ATTRIBUTES
} from "../../constants/list-headers";
import { Voucher, VoucherStatus } from "../../models/voucher";
import VisitService from "../../services/VisitService";
import { formatDate } from "../../utils/dateUtils";

export interface VisitCartItemListProps {
  attributes: ListAttribute[];
  items: (NewVisitItem | NewSaleItem | VisitItem | SaleItem)[];
  visitPreview?: Visit | null;
  onRemoveByIndex?: (index: number) => void;
  onFreezePrice?: (index: number) => void;
  onSaleItemPriceChange?: (index: number, value: number) => void;
  onManageBoostByIndex?: (index: number) => void;
  className?: string;
  allowFreezeHover?: boolean;
}

function isVisitItem(
  item: NewVisitItem | NewSaleItem | VisitItem | SaleItem
): item is NewVisitItem | VisitItem {
  return "service" in item;
}

function isNewSaleItem(
  item: NewVisitItem | NewSaleItem | VisitItem | SaleItem
): item is NewSaleItem | SaleItem {
  return "product" in item;
}

function isSaleItem(
  item: NewVisitItem | NewSaleItem | VisitItem | SaleItem
): item is NewSaleItem | SaleItem {
  return (
    "product" in item && "id" in item && typeof (item as any).id === "number"
  );
}

function isVoucher(
  item: NewVisitItem | NewSaleItem | VisitItem | SaleItem
): item is NewSaleItem | SaleItem {
  return (
    "voucher" in item && "id" in item && typeof (item as any).id === "number"
  );
}

function isNewVoucher(
  item: NewVisitItem | NewSaleItem | VisitItem | SaleItem
): item is NewSaleItem | SaleItem {
  return "voucher" in item;
}

export function VisitCartItemList({
  attributes,
  items,
  visitPreview,
  onRemoveByIndex,
  onFreezePrice,
  onSaleItemPriceChange,
  onManageBoostByIndex,
  className = "",
  allowFreezeHover = true,
}: VisitCartItemListProps) {
  const [previewItems, setPreviewItems] = useState<VisitItem[] | null>(null);
  const [voucherVisitMap, setVoucherVisitMap] = useState<Record<number, Visit>>(
    {}
  );

  const handleCostChange = useCallback(
    (index: number, value: number) => {
      onSaleItemPriceChange?.(index, value);
    },
    [onSaleItemPriceChange]
  );

  const fetchVisitPaidByVoucher = async (voucherId: string | number) => {
    const visit = await VisitService.findVisitPaidByVoucher(voucherId);

      setVoucherVisitMap((prev) => ({
      ...prev,
      [voucherId]: visit,
    }));
    
  };

  useEffect(() => {
    items.map((item) => {
      if (
        isVoucher(item) &&
        item.voucher &&
        "id" in item.voucher &&
        item.voucher.status === VoucherStatus.USED
      ) {
        fetchVisitPaidByVoucher(item.voucher.id);
      }
    });
  }, [items]);

  useEffect(() => {
    if (visitPreview) {
      setPreviewItems(visitPreview.items);
    }
  }, [visitPreview]);

  const renderAttributeContent = (
    attr: ListAttribute,
    item: NewVisitItem | NewSaleItem | VisitItem | SaleItem,
    index?: number
  ): React.ReactNode => {
    const visitItem = isVisitItem(item) ? item : undefined;
    const newSaleItem =
      isNewSaleItem(item) || isNewVoucher(item) ? item : undefined;
    const saleItem = isSaleItem(item) || isVoucher(item) ? item : undefined;
    const voucher = isVoucher(item) || isNewVoucher(item);
    const color =
      visitItem?.service?.category?.color ??
      newSaleItem?.product?.category?.color ??
      (voucher ? "204, 204, 204" : undefined);
    const badgeClass = visitItem
      ? "badge p-0 height-max"
      : "category-container width-40 p-0";

    switch (attr.name) {
      case "":
        return (
          <div
            className={badgeClass}
            style={{
              backgroundColor: color ? `rgb(${color})` : undefined,
            }}
          />
        );

      case "Boost":
        return(
          <div className="item-list-single-item-action-buttons flex">
            
              <ActionButton
              src={`${visitItem && visitItem.boostItem ? "src/assets/boost.svg" :  "src/assets/boost_off.svg"}`}
              alt="Usługa Boost"
              iconTitle={"Usługa Boost"}
              text="Usługa Boost"
              onClick={(e) => {
                e.stopPropagation();
                if (index !== undefined) {
                  onManageBoostByIndex?.(index);
                }
              }}
              disableImg={attributes == SERVICES_BOOST_VISIT_CONTENT_ATTRIBUTES && visitItem && !visitItem.boostItem}
              disableText={true}
              className={`${className} boost ${attributes == SERVICES_BOOST_VISIT_CONTENT_ATTRIBUTES ? "no-animation" : ""}`}
            />
            
          </div>
        )

      case "Nazwa":
        return visitItem?.serviceVariant
          ? visitItem?.service?.name + " - " + visitItem?.serviceVariant.name
          : visitItem?.service?.name ??
              newSaleItem?.product?.name ??
              (voucher ? "Voucher podarunkowy" : "-");

      case "Pierwotny Koszt":
        if (visitItem && items.length == previewItems?.length) {
          return (
            <div className={`${className} qv-span`}>
              {previewItems[index!].finalPrice + " zł"}
            </div>
          );
        }

      case "Warning":
        return (
            <>
              {voucher &&
                item.voucher &&
                "id" in item.voucher &&
                voucherVisitMap[item.voucher.id] && (
                  <div className="flex g-5px align-items-center">
            <img
              src={"src/assets/warning.svg"}
              alt="Warning"
              className="voucher-warning-icon"
            />
            <div className="redirect-warning-visit flex g-5px align-items-center">
                    <span className="qv-span f10 warning">
                      {`${formatDate(voucherVisitMap[item.voucher.id].date)} `}
                    </span>
                    <span className="qv-span f10 warning">
                      {` ${voucherVisitMap[item.voucher.id].client.firstName} ${
                        voucherVisitMap[item.voucher.id].client.lastName
                      }`}
                    </span>
                  </div>
          </div>
                )}
           </> 
        );

      case "Koszt":
        if (visitItem) {
          return (
            <div
              className={`${className} ${
                visitItem && ((attributes === SERVICES_DISCOUNTED_VISIT_ATTRIBUTES || attributes === SERVICES_VISIT_ATTRIBUTES) && allowFreezeHover) ? "pointer" : ""
              } visit-item-cost attribute-item flex ${
                (attributes === SERVICES_DISCOUNTED_VISIT_ATTRIBUTES || attributes === SERVICES_VISIT_ATTRIBUTES) &&
                visitItem?.finalPrice != null
                  ? "frozen"
                  : attributes === SERVICES_DISCOUNTED_VISIT_ATTRIBUTES
                  ? "discounted"
                  : ""
              }
              ${
                ((attributes === SERVICES_DISCOUNTED_VISIT_ATTRIBUTES || attributes === SERVICES_VISIT_ATTRIBUTES) && allowFreezeHover) ? "allow-hover" : ""
              }
              `}
              onClick={(e) => {
                e.stopPropagation();
                onFreezePrice?.(index!);
              }}
            >
              {visitItem.finalPrice ??
                visitItem.serviceVariant?.price ??
                visitItem.service?.price ??
                0}{" "}
              zł
            </div>
          );
        }

        if (saleItem) {
          return (
            <div
              className={`${className} ${
                saleItem && (attributes === SERVICES_DISCOUNTED_VISIT_ATTRIBUTES || attributes === SERVICES_VISIT_ATTRIBUTES) ? "pointer" : ""
              } visit-item-cost attribute-item flex`}
            >
              {saleItem.price ?? 0} zł
            </div>
          );
        }

        if (newSaleItem) {
          return (
            <div className="flex align-items-center g-5px">
              <CostInput
                initialValue={newSaleItem.price ?? 0}
                onChange={(newValue) => handleCostChange(index!, newValue)}
                className={className}
              />
              <span className="qv-span">zł</span>
            </div>
          );
        }

        return "-";

      case "Remove":
        return (
          <div className="item-list-single-item-action-buttons flex">
            <ActionButton
              src="src/assets/cancel.svg"
              alt="Usuń"
              iconTitle={"Usuń"}
              text="Usuń"
              onClick={(e) => {
                e.stopPropagation();
                if (index !== undefined) {
                  onRemoveByIndex?.(index);
                }
              }}
              disableText={true}
              className={className}
            />
          </div>
        );

      default:
        return <span>{"-"}</span>;
    }
  };

  return (
    <div
      className={`item-list width-max grid p-0 ${
        items.length === 0 ? "border-none" : ""
      } ${className}`}
    >
      {items.map((item, index) => {
        const id = isVisitItem(item)
          ? item.service?.id
          : isNewSaleItem(item)
          ? item.product?.id
          : index;

        return (
          <div
            key={`${id}-${index}`}
            className={`product-wrapper ${className}`}
          >
            <div
              className={`item align-items-center pointer flex ${className}`}
            >
              {attributes.map((attr) => (
                <div
                  key={`${id}-${attr.name}`}
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
        );
      })}
    </div>
  );
}
export default VisitCartItemList;
