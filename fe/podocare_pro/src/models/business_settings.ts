export interface StatSettings {
    id: number;
    bonusThreshold: number;
    servicesRevenueGoal: number;
    productsRevenueGoal: number;
    saleBonusPayoutMonths: number[];
}

export interface NewStatSettings {
    bonusThreshold: number;
    servicesRevenueGoal: number;
    productsRevenueGoal: number;
    saleBonusPayoutMonths: number[];
}