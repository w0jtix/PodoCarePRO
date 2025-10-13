export interface ListAttribute {
  name: string;
  width?: string | number;
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'start' | 'end';
  size?: string | number;
}

export const SERVICES_LIST_ATTRIBUTES: ListAttribute[] = [
  { name: "", width: "2%", justify: "start" },
  { name: "Kategoria", width: "13%", justify: "start" },
  { name: "Nazwa", width: "57%", justify: "start" },
  { name: "Czas", width: "10%", justify: "center" },
  { name: "Cena", width: "10%", justify: "center" },
  { name: "Opcje", width: "8%", justify: "center" },
]

export const PRODUCT_LIST_ATTRIBUTES: ListAttribute[] = [
    { name: "", width: "2%", justify: "end" },
    { name: "#", width: "3%", justify: "center" },
    { name: "Nazwa", width: "56%", justify: "flex-start" },
    { name: "Marka", width: "16%", justify: "center" },
    { name: "Stan Magazynowy", width: "16%", justify: "center" },
    { name: "Opcje", width: "8%", justify: "center" },
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

export const ORDER_NEW_PRODUCTS_POPUP_ATTRIBUTES: ListAttribute[] =[
  { name: "", width: "2%", justify: "flex-start" },
  { name: "Nazwa", width: "50%", justify: "flex-start" },
  { name: "Marka", width: "25%", justify: "center" },
  { name: "Kategoria", width: "25%", justify: "center" },
  { name: "", width: "3%", justify: "flex-start" },
]