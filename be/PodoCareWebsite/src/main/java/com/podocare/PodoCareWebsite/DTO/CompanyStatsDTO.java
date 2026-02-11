package com.podocare.PodoCareWebsite.DTO;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyStatsDTO {

    private Double servicesRevenue;
    private Double productsRevenue;
    private Double totalRevenue;
    private Double servicesRevenueShare;
    private Double productsRevenueShare;

    private Double totalExpenses;
    private List<ExpenseCategoryBreakdownDTO> expensesByCategory;

    private Double totalIncome;
    private Double costShareInRevenue;
    private Double profitabilityPercent;
}
