package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.*;
import com.podocare.PodoCareWebsite.DTO.request.EmployeeRevenueFilterDTO;
import com.podocare.PodoCareWebsite.model.constants.ChartMode;
import com.podocare.PodoCareWebsite.repo.ClientDebtRepo;
import com.podocare.PodoCareWebsite.repo.CompanyExpenseRepo;
import com.podocare.PodoCareWebsite.repo.VisitRepo;
import com.podocare.PodoCareWebsite.repo.projection.CategoryExpenseProjection;
import com.podocare.PodoCareWebsite.repo.projection.CompanyExpenseProjection;
import com.podocare.PodoCareWebsite.repo.projection.CompanyRevenueProjection;
import com.podocare.PodoCareWebsite.service.CompanyStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyStatsServiceImpl implements CompanyStatsService {

    private final VisitRepo visitRepo;
    private final CompanyExpenseRepo companyExpenseRepo;
    private final ClientDebtRepo clientDebtRepo;

    @Override
    public CompanyFinancialSummaryDTO getFinancialSummary(EmployeeRevenueFilterDTO filter) {
        boolean isYearlyMode = filter.getMode() == ChartMode.MONTHLY;

        LocalDate currentStart, currentEnd;
        LocalDate prevPeriodStart, prevPeriodEnd;
        LocalDate lastYearStart = null, lastYearEnd = null;

        if (isYearlyMode) {
            currentStart = LocalDate.of(filter.getYear(), 1, 1);
            currentEnd = LocalDate.of(filter.getYear(), 12, 31);

            prevPeriodStart = LocalDate.of(filter.getYear() - 1, 1, 1);
            prevPeriodEnd = LocalDate.of(filter.getYear() - 1, 12, 31);
        } else {
            currentStart = LocalDate.of(filter.getYear(), filter.getMonth(), 1);
            currentEnd = currentStart.withDayOfMonth(currentStart.lengthOfMonth());

            prevPeriodStart = currentStart.minusMonths(1);
            prevPeriodEnd = prevPeriodStart.withDayOfMonth(prevPeriodStart.lengthOfMonth());

            lastYearStart = LocalDate.of(filter.getYear() - 1, filter.getMonth(), 1);
            lastYearEnd = lastYearStart.withDayOfMonth(lastYearStart.lengthOfMonth());
        }

        Double currentRevenue = calculateAdjustedRevenue(currentStart, currentEnd);
        Double currentExpenses = nullToZero(companyExpenseRepo.sumTotalExpenses(currentStart, currentEnd));
        Double currentIncome = currentRevenue - currentExpenses;

        Double prevPeriodRevenue = calculateAdjustedRevenue(prevPeriodStart, prevPeriodEnd);
        Double prevPeriodExpenses = nullToZero(companyExpenseRepo.sumTotalExpenses(prevPeriodStart, prevPeriodEnd));
        Double prevPeriodIncome = prevPeriodRevenue - prevPeriodExpenses;

        Double lastYearRevenue = null;
        Double lastYearExpenses = null;
        Double lastYearIncome = null;

        if (!isYearlyMode) {
            lastYearRevenue = calculateAdjustedRevenue(lastYearStart, lastYearEnd);
            lastYearExpenses = nullToZero(companyExpenseRepo.sumTotalExpenses(lastYearStart, lastYearEnd));
            lastYearIncome = lastYearRevenue - lastYearExpenses;
        }

        return CompanyFinancialSummaryDTO.builder()
                .currentRevenue(round2(currentRevenue))
                .currentExpenses(round2(currentExpenses))
                .currentIncome(round2(currentIncome))
                .previousPeriodRevenue(round2(prevPeriodRevenue))
                .previousPeriodExpenses(round2(prevPeriodExpenses))
                .previousPeriodIncome(round2(prevPeriodIncome))
                .lastYearRevenue(isYearlyMode ? null : round2(lastYearRevenue))
                .lastYearExpenses(isYearlyMode ? null : round2(lastYearExpenses))
                .lastYearIncome(isYearlyMode ? null : round2(lastYearIncome))
                .revenueChangeVsPrevPeriod(calculatePercentageChange(prevPeriodRevenue, currentRevenue))
                .expensesChangeVsPrevPeriod(calculatePercentageChange(prevPeriodExpenses, currentExpenses))
                .incomeChangeVsPrevPeriod(calculatePercentageChange(prevPeriodIncome, currentIncome))
                .revenueChangeVsLastYear(isYearlyMode ? null : calculatePercentageChange(lastYearRevenue, currentRevenue))
                .expensesChangeVsLastYear(isYearlyMode ? null : calculatePercentageChange(lastYearExpenses, currentExpenses))
                .incomeChangeVsLastYear(isYearlyMode ? null : calculatePercentageChange(lastYearIncome, currentIncome))
                .build();
    }

    @Override
    public CompanyStatsDTO getCompanyStats(EmployeeRevenueFilterDTO filter) {
        boolean isYearlyMode = filter.getMode() == ChartMode.MONTHLY;

        LocalDate startDate, endDate;
        if (isYearlyMode) {
            startDate = LocalDate.of(filter.getYear(), 1, 1);
            endDate = LocalDate.of(filter.getYear(), 12, 31);
        } else {
            startDate = LocalDate.of(filter.getYear(), filter.getMonth(), 1);
            endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        }

        Double servicesRevenue = calculateAdjustedServicesRevenue(startDate, endDate);
        Double productsRevenue = calculateAdjustedProductsRevenue(startDate, endDate);
        Double totalRevenue = calculateAdjustedRevenue(startDate, endDate);

        Double servicesShare = totalRevenue > 0 ? (servicesRevenue / totalRevenue) * 100 : 0.0;
        Double productsShare = totalRevenue > 0 ? (productsRevenue / totalRevenue) * 100 : 0.0;

        Double totalExpenses = nullToZero(companyExpenseRepo.sumTotalExpenses(startDate, endDate));

        List<CategoryExpenseProjection> categoryProjections =
                companyExpenseRepo.findExpensesByCategory(startDate, endDate);

        final Double finalTotalExpenses = totalExpenses;
        List<ExpenseCategoryBreakdownDTO> expensesByCategory = categoryProjections.stream()
                .map(proj -> {
                    Double amount = proj.getTotalAmount() != null
                            ? proj.getTotalAmount().doubleValue()
                            : 0.0;
                    Double share = finalTotalExpenses > 0 ? (amount / finalTotalExpenses) * 100 : 0.0;
                    return ExpenseCategoryBreakdownDTO.builder()
                            .category(proj.getCategory())
                            .amount(round2(amount))
                            .sharePercent(round2(share))
                            .build();
                })
                .collect(Collectors.toList());

        Double totalIncome = totalRevenue - totalExpenses;
        Double costShareInRevenue = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0.0;
        Double profitabilityPercent = totalRevenue > 0 ? (totalIncome / totalRevenue) * 100 : 0.0;

        return CompanyStatsDTO.builder()
                .servicesRevenue(round2(servicesRevenue))
                .productsRevenue(round2(productsRevenue))
                .totalRevenue(round2(totalRevenue))
                .servicesRevenueShare(round2(servicesShare))
                .productsRevenueShare(round2(productsShare))
                .totalExpenses(round2(totalExpenses))
                .expensesByCategory(expensesByCategory)
                .totalIncome(round2(totalIncome))
                .costShareInRevenue(round2(costShareInRevenue))
                .profitabilityPercent(round2(profitabilityPercent))
                .build();
    }

    @Override
    public CompanyRevenueDTO getCompanyRevenueChart(EmployeeRevenueFilterDTO filter) {
        if (filter.getMode() == ChartMode.MONTHLY) {
            return getMonthlyChart(filter.getYear());
        } else {
            return getDailyChart(filter.getYear(), filter.getMonth());
        }
    }

    private CompanyRevenueDTO getMonthlyChart(Integer year) {
        List<CompanyRevenueProjection> revenueProjections =
                visitRepo.findCompanyMonthlyRevenueByYear(year);
        List<CompanyExpenseProjection> expenseProjections =
                companyExpenseRepo.findMonthlyExpensesByYear(year);

        Map<Integer, BigDecimal> revenueByMonth = revenueProjections.stream()
                .collect(Collectors.toMap(
                        CompanyRevenueProjection::getPeriod,
                        CompanyRevenueProjection::getRevenue,
                        (a, b) -> a
                ));

        Map<Integer, BigDecimal> expensesByMonth = expenseProjections.stream()
                .collect(Collectors.toMap(
                        CompanyExpenseProjection::getPeriod,
                        CompanyExpenseProjection::getTotalExpense,
                        (a, b) -> a
                ));

        List<BigDecimal> revenueData = new ArrayList<>();
        List<BigDecimal> expensesData = new ArrayList<>();
        List<BigDecimal> incomeData = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            BigDecimal revenue = revenueByMonth.getOrDefault(month, BigDecimal.ZERO);
            BigDecimal expenses = expensesByMonth.getOrDefault(month, BigDecimal.ZERO);
            BigDecimal income = revenue.subtract(expenses);

            revenueData.add(revenue);
            expensesData.add(expenses);
            incomeData.add(income);
        }

        return CompanyRevenueDTO.builder()
                .revenueData(revenueData)
                .expensesData(expensesData)
                .incomeData(incomeData)
                .build();
    }

    private CompanyRevenueDTO getDailyChart(Integer year, Integer month) {
        int daysInMonth = YearMonth.of(year, month).lengthOfMonth();

        List<CompanyRevenueProjection> revenueProjections =
                visitRepo.findCompanyDailyRevenueByYearAndMonth(year, month);
        List<CompanyExpenseProjection> expenseProjections =
                companyExpenseRepo.findDailyExpensesByYearAndMonth(year, month);

        Map<Integer, BigDecimal> revenueByDay = revenueProjections.stream()
                .collect(Collectors.toMap(
                        CompanyRevenueProjection::getPeriod,
                        CompanyRevenueProjection::getRevenue,
                        (a, b) -> a
                ));

        Map<Integer, BigDecimal> expensesByDay = expenseProjections.stream()
                .collect(Collectors.toMap(
                        CompanyExpenseProjection::getPeriod,
                        CompanyExpenseProjection::getTotalExpense,
                        (a, b) -> a
                ));

        List<BigDecimal> revenueData = new ArrayList<>();
        List<BigDecimal> expensesData = new ArrayList<>();
        List<BigDecimal> incomeData = new ArrayList<>();

        for (int day = 1; day <= daysInMonth; day++) {
            BigDecimal revenue = revenueByDay.getOrDefault(day, BigDecimal.ZERO);
            BigDecimal expenses = expensesByDay.getOrDefault(day, BigDecimal.ZERO);
            BigDecimal income = revenue.subtract(expenses);

            revenueData.add(revenue);
            expensesData.add(expenses);
            incomeData.add(income);
        }

        return CompanyRevenueDTO.builder()
                .revenueData(revenueData)
                .expensesData(expensesData)
                .incomeData(incomeData)
                .build();
    }


    /** Total payments - voucher payments (since vouchers were already paid at purchase) */
    private Double calculateAdjustedRevenue(LocalDate from, LocalDate to) {
        Double totalRevenue = visitRepo.sumCompanyTotalRevenue(from, to);
        Double voucherPayments = visitRepo.sumCompanyVoucherPayments(from, to);

        return nullToZero(totalRevenue) - nullToZero(voucherPayments);
    }

    /** Services from visits - voucher payments + vouchers sold value - unpaid from partial visits */
    private Double calculateAdjustedServicesRevenue(LocalDate from, LocalDate to) {
        Double servicesFromVisits = visitRepo.sumCompanyServicesRevenue(from, to);
        Double voucherPayments = visitRepo.sumCompanyVoucherPayments(from, to);
        Double vouchersSoldValue = visitRepo.sumCompanyVouchersSoldValue(from, to);
        Double debtRedemptions = visitRepo.sumCompanyAllDebtRedemptions(from, to);

        // For Payment PARTIAL: subtract unpaid part (servicesValue - payment (paid part))
        Double partialServicesValue = visitRepo.sumCompanyPartialVisitsServicesValue(from, to);
        Double partialPayments = visitRepo.sumCompanyPartialVisitsPayments(from, to);
        Double unpaidFromPartial = nullToZero(partialServicesValue) - nullToZero(partialPayments);

        return nullToZero(servicesFromVisits) - nullToZero(voucherPayments) + nullToZero(vouchersSoldValue) + nullToZero(debtRedemptions) - unpaidFromPartial;
    }

    /**  Products sale value - vouchers sold value (vouchers are counted in services) */
    private Double calculateAdjustedProductsRevenue(LocalDate from, LocalDate to) {
        Double productsRevenue = visitRepo.sumCompanyProductsRevenue(from, to);
        Double vouchersSoldValue = visitRepo.sumCompanyVouchersSoldValue(from, to);

        return nullToZero(productsRevenue) - nullToZero(vouchersSoldValue);
    }

    private Double calculatePercentageChange(Double previous, Double current) {
        previous = nullToZero(previous);
        current = nullToZero(current);

        if (previous == 0.0) {
            if (current > 0) return 100.0;
            if (current < 0) return -100.0;
            return 0.0;
        }
        return round2(((current - previous) / Math.abs(previous)) * 100);
    }

    private Double nullToZero(Double value) {
        return value != null ? value : 0.0;
    }

    private Double round2(Double value) {
        if (value == null) return 0.0;
        return Math.round(value * 100.0) / 100.0;
    }
}
