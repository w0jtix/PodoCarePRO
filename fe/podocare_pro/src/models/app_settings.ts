export interface AppSettings {
    id: number;
    voucherExpiryTime: number;
    visitAbsenceRate: number;
    visitVipRate: number;
    boostNetRate: number;
    googleReviewDiscount: number;
    booksyHappyHours: number;
}

export interface NewAppSettings {
    voucherExpiryTime: number;
    visitAbsenceRate: number;
    visitVipRate: number;
    boostNetRate: number;
    googleReviewDiscount: number;
    booksyHappyHours: number;
}