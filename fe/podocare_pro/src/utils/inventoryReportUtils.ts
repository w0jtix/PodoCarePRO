import { InventoryReportItem, NewInventoryReportItem } from "../models/inventory_report";

export const getSupplyChange = (item: InventoryReportItem | NewInventoryReportItem) => {
  if (item.supplyAfter != null && item.supplyBefore != null) {
    const diff = item.supplyAfter - item.supplyBefore;
    return { label: (diff >= 0 ? "+" : "") + diff, className: diff > 0 ? "positive" : diff < 0 ? "negative" : "neutral" };
  }
  return { label: "", className: "" };
};
