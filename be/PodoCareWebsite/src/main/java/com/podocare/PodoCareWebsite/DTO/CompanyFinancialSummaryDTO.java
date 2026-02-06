package com.podocare.PodoCareWebsite.DTO;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyFinancialSummaryDTO {

    private Double currentRevenue;
    private Double currentExpenses;
    private Double currentIncome;

    private Double previousPeriodRevenue;
    private Double previousPeriodExpenses;
    private Double previousPeriodIncome;

    private Double lastYearRevenue;
    private Double lastYearExpenses;
    private Double lastYearIncome;

    private Double revenueChangeVsPrevPeriod;
    private Double expensesChangeVsPrevPeriod;
    private Double incomeChangeVsPrevPeriod;

    private Double revenueChangeVsLastYear;
    private Double expensesChangeVsLastYear;
    private Double incomeChangeVsLastYear;
}
