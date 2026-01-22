export enum VatRate {
    VAT_23 = 'VAT_23',
    VAT_8 = 'VAT_8',
    VAT_7 = 'VAT_7',
    VAT_5 = 'VAT_5',
    VAT_0 = 'VAT_0',
    VAT_ZW = 'VAT_ZW',
    VAT_NP = 'VAT_NP',
}

export const VAT_RATE_LABELS: Record<VatRate, string> = {
    [VatRate.VAT_23]: "23%",
    [VatRate.VAT_8]: "8%",
    [VatRate.VAT_7]: "7%",
    [VatRate.VAT_5]: "5%",
    [VatRate.VAT_0]: "0%",
    [VatRate.VAT_ZW]: "ZW",
    [VatRate.VAT_NP]: "NP",
};

export const getVatRateDisplay = (rate: VatRate): string => {
    return VAT_RATE_LABELS[rate] || rate;
};

export const VAT_NUMERIC_VALUES: Record<VatRate, number> = {
  [VatRate.VAT_23]: 23,
  [VatRate.VAT_8]: 8,
  [VatRate.VAT_7]: 7,
  [VatRate.VAT_5]: 5,
  [VatRate.VAT_0]: 0,
  [VatRate.VAT_ZW]: 0,
  [VatRate.VAT_NP]: 0,
};