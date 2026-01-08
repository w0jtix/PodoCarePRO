import { DebtRedemption, NewDebtRedemption } from "./debt";
import { Client, NewClient } from "./client";
import { Employee } from "./employee";
import { Sale, NewSale } from "./sale";
import { BaseService, ServiceVariant } from "./service";
import { Payment, PaymentStatus, NewPayment } from "./payment";
import { AppSettings } from "./app_settings";

export interface Discount {
    id: number;
    name: string;
    percentageValue: number;
    clients?: Client[];
    clientCount?: number;
}

export interface NewDiscount {
    name: string;
    percentageValue: number;
    clients?: Client[];
}

export enum VisitDiscountType {
    CLIENT_DISCOUNT = "CLIENT_DISCOUNT",
    HAPPY_HOURS = "HAPPY_HOURS",
    GOOGLE_REVIEW = "GOOGLE_REVIEW",
    CUSTOM = "CUSTOM"
}

export const discountLabelFor = (type: VisitDiscountType, visit: Visit | NewVisit, settings: AppSettings) => {
    switch (type) {
      case VisitDiscountType.CLIENT_DISCOUNT:
        if ('id' in visit) {
          const clientDiscount = visit.serviceDiscounts?.find(d => d.type === VisitDiscountType.CLIENT_DISCOUNT);
          if (clientDiscount && clientDiscount.name) {
            return `${clientDiscount.name} ${clientDiscount.percentageValue}%`;
          }
        }
        return `${visit.client?.discount?.name} ${visit.client?.discount?.percentageValue}%`;
      case VisitDiscountType.HAPPY_HOURS:
        return `Booksy ${settings?.booksyHappyHours}%`;
      case VisitDiscountType.GOOGLE_REVIEW:
        return `Opinia ${settings?.googleReviewDiscount}%`;
      case VisitDiscountType.CUSTOM:
        return `Własny`;
      default:
        return type;
    }
  };
  export const discountSrcFor = (type: VisitDiscountType) => {
    switch (type) {
      case VisitDiscountType.CLIENT_DISCOUNT:
        return "src/assets/client_discount.svg";
      case VisitDiscountType.HAPPY_HOURS:
        return "src/assets/booksy.png";
      case VisitDiscountType.GOOGLE_REVIEW:
        return "src/assets/google.png";
      case VisitDiscountType.CUSTOM:
        return "src/assets/active_google_review.svg";
      default:
        return type;
    }
  };

export interface VisitDiscount {
    id: number;
    type: VisitDiscountType;
    name: string | null;
    percentageValue: number;
    clientDiscountId: number | string | null;
    reviewId: number | string | null;
}

export interface NewVisitDiscount {
    type: VisitDiscountType;
    percentageValue?: number;
    clientDiscountId?: number | string | null;
    reviewId?: number | string | null;
}

export interface Visit {
    id: number;
    client: Client;
    employee: Employee;
    serviceDiscounts: VisitDiscount[];
    receipt:boolean;
    isBoost: boolean;
    isVip: boolean;
    delayTime: number | null;
    absence: boolean;
    items: VisitItem[];
    sale: Sale | null;
    debtRedemptions: DebtRedemption[];
    date: string;
    paymentStatus: PaymentStatus;
    payments: Payment[];
    notes: string | null;
    totalNet: number;
    totalVat: number;
    totalValue: number;
}

export interface NewVisit {
    client: Client | null;
    employee: Employee | null;
    serviceDiscounts?: NewVisitDiscount[] | null;
    receipt:boolean;
    isBoost: boolean;
    isVip: boolean;
    delayTime?: number | null;
    absence: boolean;
    items: NewVisitItem[];
    sale?: NewSale | null;
    debtRedemptions: NewDebtRedemption[];
    date: string;
    payments: NewPayment[];
    notes?: string | null;
}


export interface VisitItem {
    id:number;
    service: BaseService | null;
    serviceVariant: ServiceVariant | null;
    name: string;
    duration: number;
    boostItem: boolean;
    netValue: number;
    vatValue: number;
    price: number;
    finalPrice: number;
}

export interface NewVisitItem {
    service?: BaseService;
    serviceVariant?: ServiceVariant | null;
    boostItem?: boolean | null;
    finalPrice?: number | null; // won't add discounts to this item if finalPrice is provided.
}

export interface VisitFilterDTO {
    clientIds?: number[] | string[] | null,
    serviceIds?: number[] | string[] | null,
    employeeIds?: number[] | string[] | null,
    isBoost?: boolean | null;
    isVip?: boolean | null;
    delayed?: boolean | null;
    absence?: boolean | null;
    hasDiscount?: boolean | null;
    hasSale?: boolean | null;
    dateFrom?: string | null;
    dateTo?: string | null;
    paymentStatus?: PaymentStatus | null;
    totalValueFrom?: number | null;
    totalValueTo?: number | null;
}
