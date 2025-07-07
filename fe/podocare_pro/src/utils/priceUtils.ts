import { VatRate } from "../models/vatrate";
import { VAT_NUMERIC_VALUES } from "../models/vatrate";

export const formatPrice = (value: number | null): string => {
    return value !== null ? value.toFixed(2) : "—";
  };

export const calculateNetPrice = (total: number, vatRate: VatRate) => {
    const rate = VAT_NUMERIC_VALUES[vatRate] ?? 0;
    const result = total / (1 + rate / 100);
    return result.toFixed(2);
  };