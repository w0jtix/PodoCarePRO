export interface ListAttribute {
  name: string;
  width?: string | number;
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'start' | 'end';
  size?: string | number;
}

export const VISIT_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "3%", justify: "center" },
  { name: "Data", width: "6%", justify: "center" },
  { name: "Pracownik", width: "12%", justify: "center" },
  { name: "Klient", width: "15%", justify: "start" },
  { name: " ", width: "43%", justify: "start" },
  { name: "Wartość", width: "7%", justify: "center" },
  { name: "Status", width: "7%", justify: "center" },
  { name: "Opcje", width: "7%", justify: "center" },
]

export const CLIENTS_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "#", width: "4%", justify: "center" },
  { name: "Klient", width: "20%", justify: "start" },
  { name: "", width: "58%", justify: "start" },
  { name: "Wizyty", width: "10%", justify: "center" },
  { name: "Opcje", width: "8%", justify: "center" },
]

export const CLIENTS_DISCOUNT_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: " ", width: "4%", justify: "center" },
  { name: "Klient", width: "50%", justify: "start" },
  { name: "Zniżka", width: "46%", justify: "center" },
]

export const DISCOUNTS_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "%", width: "15%", justify: "center" },
  { name: "Nazwa", width: "50%", justify: "start" },
  { name: "Klienci", width: "20%", justify: "center" },
  { name: "Opcje", width: "15%", justify: "center" },
]

export const REVIEWS_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "Źródło", width: "10%", justify: "center" },
  { name: "Status", width: "12%", justify: "center" },
  { name: "Klient", width: "48%", justify: "start" },
  { name: "Dodano", width: "20%", justify: "center" },
  { name: "Opcje", width: "10%", justify: "center" },
]

export const VOUCHERS_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "Status", width: "10%", justify: "center" },
  { name: "Klient", width: "20%", justify: "center" },
  { name: "Wartość", width: "20%", justify: "center" },
  { name: "Ważny od", width: "20%", justify: "center" },
  { name: "Ważny do", width: "20%", justify: "center" },
  { name: "Opcje", width: "10%", justify: "center" },
]

export const VOUCHERS_AS_PAYMENT_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: " ", width: "10%", justify: "center" },
  { name: "Klient", width: "50%", justify: "start" },
  { name: "Wartość", width: "20%", justify: "center" },
  { name: "Ważny do", width: "20%", justify: "center" },
]

export const VOUCHERS_VISIT_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "Status", width: "20%", justify: "center" },
  { name: "Klient", width: "60%", justify: "start" },
  { name: "Wartość", width: "20%", justify: "center" },
]

export const DEBTS_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "Status", width: "10%", justify: "center" },
  { name: "Klient", width: "20%", justify: "center" },
  { name: "Przyczyna", width: "20%", justify: "center" },
  { name: "Źródło", width: "20%", justify: "center" },
  { name: "Wartość", width: "20%", justify: "center" },
  { name: "Opcje", width: "10%", justify: "center" },
]

export const DEBTS_VISIT_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "5%", justify: "start" },
  { name: "Przyczyna", width: "35%", justify: "start" },
  { name: "Źródło", width: "40%", justify: "center" },
  { name: "Wartość", width: "20%", justify: "center" },
]

export const DEBTS_BY_VISIT_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "4%", justify: "start" },
  { name: "Przyczyna", width: "25%", justify: "start" },
  { name: "Status", width: "46%", justify: "center" },
  { name: "Wartość", width: "25%", justify: "center" },
]

export const SERVICES_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "2%", justify: "start" },
  { name: "Kategoria", width: "13%", justify: "start" },
  { name: "Nazwa", width: "57%", justify: "start" },
  { name: "Czas", width: "10%", justify: "center" },
  { name: "Cena", width: "10%", justify: "center" },
  { name: "Opcje", width: "8%", justify: "center" },
]

export const SERVICES_PRICE_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "4%", justify: "start" },
  { name: "Nazwa", width: "76%", justify: "start" },
  { name: "Cena", width: "20%", justify: "center" },
]
export const SERVICES_VISIT_CONTENT_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "4%", justify: "start" },
  { name: "Nazwa", width: "86%", justify: "start" },
  { name: "Koszt", width: "10%", justify: "center" },
]
export const SERVICES_BOOST_VISIT_CONTENT_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "4%", justify: "start" },
  { name: "Boost", width: "10%", justify: "center" },
  { name: "Nazwa", width: "76%", justify: "start" },
  { name: "Koszt", width: "10%", justify: "center" },
]
export const SERVICES_BOOST_VISIT_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "4%", justify: "start" },
  { name: "Boost", width: "10%", justify: "center" },
  { name: "Nazwa", width: "62%", justify: "start" },
  { name: "Koszt", width: "20%", justify: "center" },
  { name: "Remove", width: "4%", justify: "center" },
]
export const SERVICES_BOOST_DISCOUNTED_VISIT_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "4%", justify: "start" },
  { name: "Boost", width: "10%", justify: "center" },
  { name: "Nazwa", width: "42%", justify: "start" },
  { name: "Pierwotny Koszt", width: "20%", justify: "center" },
  { name: "Koszt", width: "20%", justify: "center" }, 
  { name: "Remove", width: "4%", justify: "center" },
]
export const SERVICES_VISIT_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "4%", justify: "start" },
  { name: "Nazwa", width: "72%", justify: "start" },
  { name: "Koszt", width: "20%", justify: "center" },
  { name: "Remove", width: "4%", justify: "center" },
]
export const SERVICES_DISCOUNTED_VISIT_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "4%", justify: "start" },
  { name: "Nazwa", width: "52%", justify: "start" },
  { name: "Pierwotny Koszt", width: "20%", justify: "center" },
  { name: "Koszt", width: "20%", justify: "center" }, 
  { name: "Remove", width: "4%", justify: "center" },
]
export const PRODUCT_VISIT_LIST_CONTENT_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "3%", justify: "center" },
  { name: "Nazwa", width: "87%", justify: "flex-start" },
  { name: "Koszt", width: "10%", justify: "center" },
]
export const VOUCHER_VISIT_LIST_CONTENT_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "3%", justify: "center" },
  { name: "Nazwa", width: "35%", justify: "flex-start" },
  { name: "Warning", width: "62%", justify: "flex-start" },
  { name: "Koszt", width: "10%", justify: "center" },
]
export const PRODUCT_VISIT_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "4%", justify: "start" },
  { name: "Nazwa", width: "62%", justify: "flex-start" },
  { name: "Koszt", width: "30%", justify: "center" },
  { name: "Remove", width: "4%", justify: "center" },
]

export const PRODUCT_LIST_ATTRIBUTES: ListAttribute[] = [
    { name: "", width: "2%", justify: "end" },
    { name: "#", width: "3%", justify: "center" },
    { name: "Nazwa", width: "66%", justify: "flex-start" },
    { name: "Marka", width: "12%", justify: "center" },
    { name: "Stan Magazynowy", width: "9%", justify: "center" },
    { name: "Opcje", width: "8%", justify: "center" },
];

export const PRODUCT_POPUP_LIST_ATTRIBUTES: ListAttribute[] = [
    { name: "", width: "6%", justify: "center" },
    { name: "Nazwa", width: "50%", justify: "flex-start" },
    { name: "Marka", width: "29%", justify: "center" },
    { name: "Stan Magazynowy", width: "15%", justify: "center" },
];

export const PRODUCT_VOLUME_LIST_ATTRIBUTES: ListAttribute[] = [
    { name: "", width: "2%", justify: "end" },
    { name: "#", width: "3%", justify: "center" },
    { name: "Nazwa", width: "61%", justify: "flex-start" }, 
    { name: "Cena", width: "5%", justify: "center" },
    { name: "Marka", width: "12%", justify: "center" },
    { name: "Stan Magazynowy", width: "9%", justify: "center" },
    { name: "Opcje", width: "8%", justify: "center" },
];

export const PRODUCT_PRICE_LIST_ATTRIBUTES: ListAttribute[] = [
    { name: "empty", width: "2%", justify: "start" },
    { name: "", width: "10%", justify: "start" },
    { name: "Nazwa", width: "50%", justify: "flex-start" },
    { name: "Cena", width: "22%", justify: "center" },
    { name: "Stan Magazynowy", width: "16%", justify: "center" },
];

export const PRODUCT_PRICE_LIST_WIDE_ATTRIBUTES: ListAttribute[] = [
    { name: "empty", width: "2%", justify: "start" },
    { name: "", width: "6%", justify: "start" },
    { name: "Nazwa", width: "72%", justify: "flex-start" },
    { name: "Cena", width: "12%", justify: "center" },
    { name: "Stan Magazynowy", width: "10%", justify: "center" },
];

export const PRODUCT_SELECT_LIST_ATTRIBUTES: ListAttribute[] = [
    { name: "empty", width: "2%", justify: "start" },
    { name: "", width: "10%", justify: "start" },
    { name: "Nazwa", width: "72%", justify: "flex-start" },
    { name: "Stan Magazynowy", width: "16%", justify: "center" },
];

export const SERVICE_VARIANTS_ATTRIBUTES: ListAttribute[] = [
  { name: "empty", width: "3%", justify: "start" },
    { name: "Nazwa", width: "67%", justify: "flex-start" },
    { name: "Cena", width: "15%", justify: "center" },
    { name: "Czas", width: "15%", justify: "center" },
];

export const ORDER_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "6%", justify: "center" },
  { name: "Nazwa", width: "70%", justify: "start" },
  { name: "Ilość", width: "10%", justify: "center" },
  { name: "Cena [szt]", width: "14%", justify: "center" },
]

export const ORDER_HISTORY_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "3%", justify: "center" },
  { name: "Numer", width: "4%", justify: "center" },
  { name: "Sklep", width: "28%", justify: "center" },
  { name: "Data Zamówienia", width: "28%", justify: "center" },
  { name: "Produkty", width: "15%", justify: "center" },
  { name: "Netto", width: "5%", justify: "center" },
  { name: "VAT", width: "5%", justify: "center" },
  { name: "Brutto", width: "5%", justify: "center" },
  { name: "Opcje", width: "7%", justify: "center" },
]

export const ORDER_HANDY_HISTORY_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "6%", justify: "center" },
  { name: "Nazwa", width: "64%", justify: "start" },
  { name: "Ilość", width: "10%", justify: "center" },
  { name: "Netto [szt]", width: "6%", justify: "center" },
  { name: "VAT", width: "6%", justify: "center" },
  { name: "Cena [szt]", width: "6%", justify: "center" },
]

export const ORDER_POPUP_HISTORY_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "6%", justify: "center" },
  { name: "Nazwa", width: "61%", justify: "start" },
  { name: "Ilość", width: "9%", justify: "center" },
  { name: "Netto [szt]", width: "8%", justify: "center" },
  { name: "VAT", width: "8%", justify: "center" },
  { name: "Cena [szt]", width: "8%", justify: "center" },
]

export const ORDERS_BY_SUPPLIER_ATTRIBUTES: ListAttribute[] = [
    { name: "", width: "6%", justify: "start" },
    { name: "Numer", width: "12%", justify: "center" },
    { name: "Data", width: "48%", justify: "center" },
    { name: "Produkty", width: "16%", justify: "center" },
    { name: "Wartość", width: "18%", justify: "center" },
  ];

export const ORDER_ITEM_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "6%", justify: "center" },
  { name: "Nazwa", width: "42%", justify: "flex-start" },
  { name: "Cena jedn.", width: "13%", justify: "center" },
  { name: "Ilość", width: "13%", justify: "center" },
  { name: "VAT", width: "13%", justify: "center" },
  { name: "Cena", width: "13%", justify: "center" },
]

export const ORDER_ITEM_WITH_BRAND_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "6%", justify: "center" },
  { name: "Nazwa", width: "25%", justify: "flex-start" },
  { name: "Marka", width: "17%", justify: "center" },
  { name: "Cena jedn.", width: "13%", justify: "center" },
  { name: "Ilość", width: "13%", justify: "center" },
  { name: "VAT", width: "13%", justify: "center" },
  { name: "Cena", width: "13%", justify: "center" },
]

export const ORDER_NEW_PRODUCTS_POPUP_ATTRIBUTES: ListAttribute[] =[
  { name: "", width: "2%", justify: "flex-start" },
  { name: "Nazwa", width: "70%", justify: "flex-start" },
  { name: "Marka", width: "25%", justify: "center" },
  { name: "Kategoria", width: "25%", justify: "center" },
  { name: "", width: "3%", justify: "flex-start" },
]

export const ORDER_NEW_PRODUCTS_POPUP_ATTRIBUTES_WITH_SELLING_PRICE: ListAttribute[] =[
  { name: "", width: "2%", justify: "flex-start" },
  { name: "Nazwa", width: "22%", justify: "flex-start" },
  { name: "Obj.", width: "12%", justify: "center" },
  { name: "Cena Sell", width: "9%", justify: "center" },
  { name: "VAT Sell", width: "12%", justify: "center" },
  { name: "Marka", width: "20%", justify: "center" },
  { name: "Kategoria", width: "20%", justify: "center" },
  { name: "", width: "2%", justify: "flex-start" },
] 

export const USAGE_RECORDS_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "4%", justify: "flex-start" },
  { name: "Produkt", width: "25%", justify: "flex-start" },
  { name: "Pracownik", width: "18%", justify: "flex-start" },
  { name: "Data", width: "23%", justify: "flex-start" },
  { name: "Ilość", width: "5%", justify: "flex-start" }, 
  { name: "Powód", width: "20%", justify: "center" },
  { name: "Opcje", width: "10%", justify: "center" },
]

export const EXPENSE_HISTORY_ATTRIBUTES: ListAttribute[] = [
  { name: " ", width: "5%", justify: "center" },
  { name: "Dostawca", width: "51%", justify: "flex-start" },
  { name: "Data Zamówienia", width: "16%", justify: "center" },
  { name: "Produkty", width: "8%", justify: "center" },
  { name: "Netto", width: "5%", justify: "center" },
  { name: "VAT", width: "5%", justify: "center" },
  { name: "Brutto", width: "5%", justify: "center" },
  { name: "Opcje", width: "7%", justify: "center" },
]

export const EXPENSE_ITEM_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "6%", justify: "center" },
  { name: "Nazwa", width: "42%", justify: "flex-start" },
  { name: "Cena jedn.", width: "13%", justify: "center" },
  { name: "Ilość", width: "13%", justify: "center" },
  { name: "VAT", width: "13%", justify: "center" },
  { name: "Cena", width: "13%", justify: "center" },
]

export const EXPENSE_HANDY_HISTORY_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "6%", justify: "center" },
  { name: "Nazwa", width: "64%", justify: "flex-start" },
  { name: "Ilość", width: "10%", justify: "center" },
  { name: "Netto [szt]", width: "6%", justify: "center" },
  { name: "VAT", width: "6%", justify: "center" },
  { name: "Cena [szt]", width: "6%", justify: "center" },
]

export const EXPENSE_POPUP_HISTORY_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "6%", justify: "center" },
  { name: "Nazwa", width: "64%", justify: "flex-start" },
  { name: "Ilość", width: "10%", justify: "center" },
  { name: "Netto [szt]", width: "6%", justify: "center" },
  { name: "VAT", width: "6%", justify: "center" },
  { name: "Cena [szt]", width: "6%", justify: "center" },
]