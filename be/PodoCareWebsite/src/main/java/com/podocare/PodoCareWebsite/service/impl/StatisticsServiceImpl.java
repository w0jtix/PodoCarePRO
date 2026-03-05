package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.*;
import com.podocare.PodoCareWebsite.DTO.request.EmployeeBonusFilterDTO;
import com.podocare.PodoCareWebsite.DTO.request.EmployeeRevenueFilterDTO;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.model.*;
import com.podocare.PodoCareWebsite.model.constants.ChartMode;
import com.podocare.PodoCareWebsite.model.constants.VatRate;
import com.podocare.PodoCareWebsite.repo.*;
import com.podocare.PodoCareWebsite.repo.projection.EmployeeRevenueProjection;
import com.podocare.PodoCareWebsite.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private final VisitRepo visitRepo;
    private final EmployeeRepo employeeRepo;
    private final OrderProductRepo orderProductRepo;
    private final UserRepo userRepo;
    private final StatSettingsRepo statSettingsRepo;
    private final AppSettingsRepo appSettingsRepo;
    private final BonusParamsSnapshotRepo bonusParamsSnapshotRepo;

    @Override
    public EmployeeRevenueDTO getEmployeeRevenue(EmployeeRevenueFilterDTO filter) {
        if (filter.getMode() == ChartMode.MONTHLY) {
            return getMonthlyRevenue(filter.getYear());
        } else {
            return getDailyRevenue(filter.getYear(), filter.getMonth());
        }
    }

    private EmployeeRevenueDTO getMonthlyRevenue(Integer year) {
        List<EmployeeRevenueProjection> projections = visitRepo.findMonthlyRevenueByYear(year);
        List<Employee> activeEmployees = employeeRepo.findAllActive();

        Map<Long, Map<Integer, BigDecimal>> employeeMonthlyData = projections.stream()
                .collect(Collectors.groupingBy(
                        EmployeeRevenueProjection::getEmployeeId,
                        Collectors.toMap(
                                EmployeeRevenueProjection::getPeriod,
                                EmployeeRevenueProjection::getRevenue,
                                (a, b) -> a
                        )
                ));

        List<EmployeeRevenueSeriesDTO> series = new ArrayList<>();

        for (Employee employee : activeEmployees) {
            Map<Integer, BigDecimal> monthlyData = employeeMonthlyData.getOrDefault(employee.getId(), new HashMap<>());

            List<BigDecimal> data = new ArrayList<>();
            for (int month = 1; month <= 12; month++) {
                data.add(monthlyData.getOrDefault(month, BigDecimal.ZERO));
            }

            series.add(EmployeeRevenueSeriesDTO.builder()
                    .employeeId(employee.getId())
                    .employeeName(employee.getName())
                    .data(data)
                    .build());
        }

        return EmployeeRevenueDTO.builder()
                .series(series)
                .build();
    }

    private EmployeeRevenueDTO getDailyRevenue(Integer year, Integer month) {
        List<EmployeeRevenueProjection> projections = visitRepo.findDailyRevenueByYearAndMonth(year, month);
        List<Employee> activeEmployees = employeeRepo.findAllActive();

        int daysInMonth = YearMonth.of(year, month).lengthOfMonth();

        Map<Long, Map<Integer, BigDecimal>> employeeDailyData = projections.stream()
                .collect(Collectors.groupingBy(
                        EmployeeRevenueProjection::getEmployeeId,
                        Collectors.toMap(
                                EmployeeRevenueProjection::getPeriod,
                                EmployeeRevenueProjection::getRevenue,
                                (a, b) -> a
                        )
                ));

        List<EmployeeRevenueSeriesDTO> series = new ArrayList<>();

        for (Employee employee : activeEmployees) {
            Map<Integer, BigDecimal> dailyData = employeeDailyData.getOrDefault(employee.getId(), new HashMap<>());

            List<BigDecimal> data = new ArrayList<>();
            for (int day = 1; day <= daysInMonth; day++) {
                data.add(dailyData.getOrDefault(day, BigDecimal.ZERO));
            }

            series.add(EmployeeRevenueSeriesDTO.builder()
                    .employeeId(employee.getId())
                    .employeeName(employee.getName())
                    .data(data)
                    .build());
        }

        return EmployeeRevenueDTO.builder()
                .series(series)
                .build();
    }

    @Override
    public List<EmployeeStatsDTO> getEmployeeStats(EmployeeRevenueFilterDTO filter) {
        boolean isYearlyMode = filter.getMode() == ChartMode.MONTHLY;

        LocalDate startDate;
        LocalDate endDate;
        LocalDate prevStartDate;
        LocalDate prevEndDate;

        if (isYearlyMode) {
            startDate = LocalDate.of(filter.getYear(), 1, 1);
            endDate = LocalDate.of(filter.getYear(), 12, 31);
            prevStartDate = LocalDate.of(filter.getYear() - 1, 1, 1);
            prevEndDate = LocalDate.of(filter.getYear() - 1, 12, 31);
        } else {
            startDate = LocalDate.of(filter.getYear(), filter.getMonth(), 1);
            endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
            prevStartDate = startDate.minusMonths(1);
            prevEndDate = prevStartDate.withDayOfMonth(prevStartDate.lengthOfMonth());
        }

        List<Employee> employees = employeeRepo.findAllActive();
        StatSettings statSettings = statSettingsRepo.getSettings();

        return employees.stream()
                .map(emp -> buildEmployeeStats(emp, statSettings, startDate, endDate, prevStartDate, prevEndDate, filter.getYear(), filter.getMonth(), isYearlyMode))
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeBonusDTO getEmployeeBonus(EmployeeBonusFilterDTO filter) {
        Employee employee = employeeRepo.findOneById(filter.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + filter.getEmployeeId()));

        StatSettings statSettings = statSettingsRepo.getSettings();

        LocalDate from = LocalDate.of(filter.getYear(), filter.getMonth(), 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());

        // Two queries to avoid MultipleBagFetchException (payments + sale.items are both List)
        List<Visit> visits = visitRepo.findVisitsForBonusWithPayments(filter.getEmployeeId(), from, to);
        visitRepo.findVisitsForBonusWithSaleItems(filter.getEmployeeId(), from, to);

        List<BonusVisitDTO> bonusVisits = new ArrayList<>();
        double monthlyTotal = 0.0;

        for (Visit visit : visits) {
            double paymentsSum = visit.getPayments().stream()
                    .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                    .sum();

            double voucherPaymentsSum = visit.getPayments().stream()
                    .filter(p -> p.getMethod() == com.podocare.PodoCareWebsite.model.constants.PaymentMethod.VOUCHER)
                    .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                    .sum();

            double productsValue = 0.0;

            if (visit.getSale() != null && visit.getSale().getItems() != null) {
                for (SaleItem item : visit.getSale().getItems()) {
                    double price = item.getPrice() != null ? item.getPrice() : 0.0;
                    if (item.getProduct() != null) {
                        productsValue += price;
                    }
                }
            }

            double adjustedRevenue = paymentsSum - productsValue - voucherPaymentsSum;

            bonusVisits.add(BonusVisitDTO.builder()
                    .visitId(visit.getId())
                    .clientName(visit.getClient().getFirstName() + " " + visit.getClient().getLastName())
                    .date(visit.getDate())
                    .paymentsSum(round2(paymentsSum))
                    .voucherPaymentsSum(round2(voucherPaymentsSum))
                    .productsValue(round2(productsValue))
                    .adjustedRevenue(round2(adjustedRevenue))
                    .build());

            monthlyTotal += adjustedRevenue;
        }

        // Resolve bonus params - snapshot (historical) or current (fallback)
        AppSettings appSettings = appSettingsRepo.getSettings();
        Optional<BonusParamsSnapshot> snapshot = bonusParamsSnapshotRepo
                .findByEmployeeIdAndYearAndMonth(employee.getId(), filter.getYear(), filter.getMonth());

        double boostNetRate;
        double bonusThreshold;
        double bonusPercent;
        double saleBonusPercent;

        if (snapshot.isPresent()) {
            BonusParamsSnapshot s = snapshot.get();
            boostNetRate = s.getBoostNetRate() != null ? s.getBoostNetRate() : 0.0;
            bonusThreshold = s.getBonusThreshold() != null ? s.getBonusThreshold() : 0.0;
            bonusPercent = s.getBonusPercent() != null ? s.getBonusPercent() : 0.0;
            saleBonusPercent = s.getSaleBonusPercent() != null ? s.getSaleBonusPercent() : 0.0;
        } else {
            boostNetRate = appSettings.getBoostNetRate() != null ? appSettings.getBoostNetRate() : 0.0;
            bonusThreshold = statSettings.getBonusThreshold();
            bonusPercent = employee.getBonusPercent() != null ? employee.getBonusPercent() : 0.0;
            saleBonusPercent = employee.getSaleBonusPercent() != null ? employee.getSaleBonusPercent() : 0.0;
        }

        // Boost cost
        List<Visit> boostVisits = visitRepo.findBoostVisitsWithItems(filter.getEmployeeId(), from, to);
        double boostCost = 0.0;
        for (Visit boostVisit : boostVisits) {
            double servicesGross = boostVisit.getItems().stream()
                    .mapToDouble(item -> item.getFinalPrice() != null ? item.getFinalPrice() : 0.0)
                    .sum();
            boostCost += servicesGross * boostNetRate / 100 * 1.23;
        }

        double adjustedTotal = monthlyTotal - boostCost;
        double bonusAmount = adjustedTotal >= bonusThreshold
                ? round2((adjustedTotal - bonusThreshold) * bonusPercent / 100)
                : 0.0;

        Double productsRevenueRaw = visitRepo.sumProductsRevenue(filter.getEmployeeId(), from, to);
        double monthlyProductsRevenue = productsRevenueRaw != null ? productsRevenueRaw : 0.0;

        ProductBonusResult currentProductBonus = calculateProductBonus(visits, saleBonusPercent, to);

        // Quarterly product bonus - previous months based on quarter position
        int quarterPosition = getQuarterPosition(filter.getMonth(), statSettings.getSaleBonusPayoutMonths());

        Double prevMonthSaleBonus = null;
        Double twoMonthPrevSaleBonus = null;

        if (quarterPosition >= 2) {
            LocalDate prevFrom = from.minusMonths(1);
            LocalDate prevTo = prevFrom.withDayOfMonth(prevFrom.lengthOfMonth());
            List<Visit> prevVisits = visitRepo.findVisitsForBonusWithSaleItems(filter.getEmployeeId(), prevFrom, prevTo);
            prevMonthSaleBonus = calculateProductBonusAmount(prevVisits, saleBonusPercent, prevTo);
        }

        if (quarterPosition >= 3) {
            LocalDate twoMonthPrevFrom = from.minusMonths(2);
            LocalDate twoMonthPrevTo = twoMonthPrevFrom.withDayOfMonth(twoMonthPrevFrom.lengthOfMonth());
            List<Visit> twoMonthPrevVisits = visitRepo.findVisitsForBonusWithSaleItems(filter.getEmployeeId(), twoMonthPrevFrom, twoMonthPrevTo);
            twoMonthPrevSaleBonus = calculateProductBonusAmount(twoMonthPrevVisits, saleBonusPercent, twoMonthPrevTo);
        }

        return EmployeeBonusDTO.builder()
                .employeeId(employee.getId())
                .employeeName(employee.getName())
                .visits(bonusVisits)
                .monthlyServicesRevenue(round2(monthlyTotal))
                .bonusThreshold(bonusThreshold)
                .bonusPercent(bonusPercent)
                .bonusAmount(round2(bonusAmount))
                .products(currentProductBonus.products)
                .monthlyProductsRevenue(round2(monthlyProductsRevenue))
                .saleBonusPercent(saleBonusPercent)
                .productBonusAmount(round2(currentProductBonus.totalAmount))
                .prevMonthSaleBonus(round2(prevMonthSaleBonus))
                .twoMonthPrevSaleBonus(round2(twoMonthPrevSaleBonus))
                .boostCost(round2(boostCost))
                .build();
    }

    private int getQuarterPosition(int month, Set<Integer> payoutMonths) {
        if (payoutMonths.contains(month)) return 3;
        int nextMonth = month == 12 ? 1 : month + 1;
        if (payoutMonths.contains(nextMonth)) return 2;
        return 1;
    }

    private double calculateProductBonusAmount(List<Visit> visits, double saleBonusPercent, LocalDate orderBeforeDate) {
        return calculateProductBonus(visits, saleBonusPercent, orderBeforeDate).totalAmount;
    }

    private ProductBonusResult calculateProductBonus(List<Visit> visits, double saleBonusPercent, LocalDate orderBeforeDate) {
        Map<Long, List<BonusProductItemDTO>> productItemsMap = new LinkedHashMap<>();
        Map<Long, String> productNames = new HashMap<>();
        Map<Long, String> brandNames = new HashMap<>();
        Map<Long, Boolean> noPurchaseHistoryMap = new HashMap<>();
        Map<Long, Boolean> fallbackUsedMap = new HashMap<>();

        for (Visit visit : visits) {
            if (visit.getSale() == null || visit.getSale().getItems() == null) continue;

            for (SaleItem saleItem : visit.getSale().getItems()) {
                if (saleItem.getProduct() == null) continue;

                Product product = saleItem.getProduct();
                Long productId = product.getId();

                productItemsMap.computeIfAbsent(productId, k -> new ArrayList<>());
                productNames.putIfAbsent(productId, product.getName());
                brandNames.putIfAbsent(productId, product.getBrand() != null ? product.getBrand().getName() : "");

                List<OrderProduct> latestOrders = orderProductRepo.findLatestByProductIdBeforeDate(productId, orderBeforeDate, PageRequest.of(0, 3));

                double saleNetPrice = saleItem.getNetValue() != null ? saleItem.getNetValue() : 0.0;
                double saleGrossPrice = saleItem.getPrice() != null ? saleItem.getPrice() : 0.0;

                if (latestOrders.isEmpty()) {
                    Double fallbackNet = product.getFallbackNetPurchasePrice();
                    VatRate fallbackVat = product.getFallbackVatRate();
                    noPurchaseHistoryMap.put(productId, true);

                    if (fallbackNet != null && fallbackVat != null) {
                        fallbackUsedMap.put(productId, true);
                        double fallbackGross = fallbackNet * (1 + fallbackVat.getRate() / 100.0);
                        double margin = saleNetPrice - fallbackNet;
                        double bonusPerUnit = margin > 0 ? round2(margin * saleBonusPercent / 100) : 0.0;
                        productItemsMap.get(productId).add(BonusProductItemDTO.builder()
                                .saleDate(visit.getDate())
                                .avgPurchaseNetPrice(round2(fallbackNet))
                                .avgPurchaseGrossPrice(round2(fallbackGross))
                                .saleNetPrice(round2(saleNetPrice))
                                .saleGrossPrice(round2(saleGrossPrice))
                                .margin(round2(margin))
                                .bonusPerUnit(bonusPerUnit)
                                .build());
                    } else {
                        fallbackUsedMap.putIfAbsent(productId, false);
                        productItemsMap.get(productId).add(BonusProductItemDTO.builder()
                                .saleDate(visit.getDate())
                                .avgPurchaseNetPrice(0.0)
                                .avgPurchaseGrossPrice(0.0)
                                .saleNetPrice(round2(saleNetPrice))
                                .saleGrossPrice(round2(saleGrossPrice))
                                .margin(0.0)
                                .bonusPerUnit(0.0)
                                .build());
                    }
                    continue;
                }

                noPurchaseHistoryMap.putIfAbsent(productId, false);
                fallbackUsedMap.putIfAbsent(productId, false);

                double avgPurchaseGrossPrice = latestOrders.stream()
                        .mapToDouble(op -> op.getPrice() != null ? op.getPrice() : 0.0)
                        .average()
                        .orElse(0.0);

                double avgPurchaseNetPrice = latestOrders.stream()
                        .mapToDouble(op -> {
                            double grossPrice = op.getPrice() != null ? op.getPrice() : 0.0;
                            double vatRate = op.getVatRate() != null ? op.getVatRate().getRate() : VatRate.VAT_23.getRate();
                            return grossPrice * 100 / (100 + vatRate);
                        })
                        .average()
                        .orElse(0.0);

                double margin = saleNetPrice - avgPurchaseNetPrice;
                double bonusPerUnit = margin > 0 ? round2(margin * saleBonusPercent / 100) : 0.0;

                productItemsMap.get(productId).add(BonusProductItemDTO.builder()
                        .saleDate(visit.getDate())
                        .avgPurchaseNetPrice(round2(avgPurchaseNetPrice))
                        .avgPurchaseGrossPrice(round2(avgPurchaseGrossPrice))
                        .saleNetPrice(round2(saleNetPrice))
                        .saleGrossPrice(round2(saleGrossPrice))
                        .margin(round2(margin))
                        .bonusPerUnit(bonusPerUnit)
                        .build());
            }
        }

        double productBonusAmount = 0.0;
        List<BonusProductDTO> products = new ArrayList<>();

        for (Map.Entry<Long, List<BonusProductItemDTO>> entry : productItemsMap.entrySet()) {
            Long productId = entry.getKey();
            List<BonusProductItemDTO> items = entry.getValue();

            double totalBonus = items.stream()
                    .mapToDouble(BonusProductItemDTO::getBonusPerUnit)
                    .sum();

            products.add(BonusProductDTO.builder()
                    .productId(productId)
                    .productName(productNames.get(productId))
                    .brandName(brandNames.get(productId))
                    .quantitySold(items.size())
                    .totalBonus(round2(totalBonus))
                    .noPurchaseHistory(noPurchaseHistoryMap.getOrDefault(productId, false))
                    .fallbackPurchasePriceUsed(fallbackUsedMap.getOrDefault(productId, false))
                    .items(items)
                    .build());

            productBonusAmount += totalBonus;
        }

        return new ProductBonusResult(products, productBonusAmount);
    }

    private record ProductBonusResult(List<BonusProductDTO> products, double totalAmount) {}

    private EmployeeStatsDTO buildEmployeeStats(Employee employee, StatSettings statSettings, LocalDate startDate, LocalDate endDate,
                                                 LocalDate prevStartDate, LocalDate prevEndDate, Integer year, Integer month, boolean isYearlyMode) {
        Long empId = employee.getId();

        String avatar = userRepo.findAvatarByEmployeeId(empId);

        Integer minutesWithClients = visitRepo.sumHoursWithClients(empId, startDate, endDate);
        Double hoursWithClients = Math.round((minutesWithClients != null ? minutesWithClients : 0) / 60.0 * 10.0) / 10.0;
        Double availableHours = isYearlyMode
                ? calculateAvailableHoursForYear(year, employee)
                : calculateAvailableHours(year, month, employee);

        Double servicesFromVisits = visitRepo.sumServicesRevenue(empId, startDate, endDate);
        Double absenceFeeRedemptions = visitRepo.sumAbsenceFeeRedemptions(empId, startDate, endDate);
        Double voucherPayments = visitRepo.sumVoucherPayments(empId, startDate, endDate);
        Double vouchersSoldValue = visitRepo.sumVouchersSoldValue(empId, startDate, endDate);

        // servicesRevenue: subtracts voucherPayments (as Vouchers Sale Value is added + vouchers are included as Services Bonus (Bonus)) - check repo for logic
        Double servicesRevenue = (servicesFromVisits != null ? servicesFromVisits : 0.0) -
                                 (voucherPayments != null ? voucherPayments : 0.0) +
                                 (absenceFeeRedemptions != null ? absenceFeeRedemptions : 0.0) +
                                 (vouchersSoldValue != null ? vouchersSoldValue : 0.0);

        int goalMultiplier = isYearlyMode ? 12 : 1;
        Double servicesRevenueGoal = statSettings.getServicesRevenueGoal() * employee.getEmploymentType().getMultiplier() * goalMultiplier;

        Double productsRevenue = visitRepo.sumProductsRevenue(empId, startDate, endDate) - (vouchersSoldValue!= null ? vouchersSoldValue : 0.0);
        Double productsRevenueGoal = statSettings.getProductsRevenueGoal() * employee.getEmploymentType().getMultiplier() * goalMultiplier;
        Double totalRevenueRaw = visitRepo.sumTotalRevenue(empId, startDate, endDate);
        // totalRevenue: subtracts voucherPayments from totalPaymentsValue since Client has already paid for given Voucher during its purchase - check repo for logic
        Double totalRevenue = (totalRevenueRaw != null ? totalRevenueRaw : 0.0) -
                              (voucherPayments != null ? voucherPayments : 0.0);

        Double totalRevenueGoal = servicesRevenueGoal + productsRevenueGoal;


        // Counts
        Integer servicesDone = visitRepo.countServicesDone(empId, startDate, endDate);
        Integer productsSold = visitRepo.countProductsSold(empId, startDate, endDate);
        Integer vouchersSold = visitRepo.countVouchersSold(empId, startDate, endDate);

        // Clients
        Integer newClients= visitRepo.countNewClients(empId, startDate, endDate);
        Integer newBoostClients = visitRepo.countNewBoostClients(empId, startDate, endDate);

        //Client conversion
        Integer clientsWithSecondVisit = visitRepo.countClientsWithSecondVisit(empId);
        Integer totalClients = visitRepo.countTotalClients(empId);
        Double clientsConversion = totalClients != null && totalClients > 0 ? round2((double) clientsWithSecondVisit / totalClients * 100) : 0.0;

        // Boost conversion
        Integer boostClientsWithSecondVisit = visitRepo.countBoostClientsWithSecondVisit(empId);
        Integer totalBoostClients = visitRepo.countTotalBoostClients(empId);
        Double boostConversion = totalBoostClients != null && totalBoostClients > 0
                ? round2((double) boostClientsWithSecondVisit / totalBoostClients * 100)
                : 0.0;

        // Best-selling items
        String topSellingServiceName = visitRepo.findTopSellingServiceName(empId, startDate, endDate);
        String topSellingProductName = visitRepo.findTopSellingProductName(empId, startDate, endDate);

        return EmployeeStatsDTO.builder()
                .id(empId)
                .name(employee.getName())
                .avatar(avatar)
                .hoursWithClients(hoursWithClients)
                .availableHours(availableHours)
                .servicesRevenue(round2(servicesRevenue))
                .servicesRevenueGoal(round2(servicesRevenueGoal))
                .productsRevenue(round2(productsRevenue))
                .productsRevenueGoal(round2(productsRevenueGoal))
                .totalRevenue(round2(totalRevenue))
                .totalRevenueGoal(round2(totalRevenueGoal))
                .servicesDone(servicesDone != null ? servicesDone : 0)
                .productsSold(productsSold != null ? productsSold : 0)
                .vouchersSold(vouchersSold != null ? vouchersSold : 0)
                .newClients(newClients != null ? newClients : 0)
                .clientsSecondVisitConversion(clientsConversion)
                .newBoostClients(newBoostClients != null ? newBoostClients : 0)
                .boostClientsSecondVisitConversion(boostConversion)
                .topSellingServiceName(topSellingServiceName != null ? topSellingServiceName : "Brak")
                .topSellingProductName(topSellingProductName != null ? topSellingProductName : "Brak")
                .build();
    }

    private Double calculateAvailableHours(Integer year, Integer month, Employee employee) {
        int workDays = countWorkDaysInMonth(year, month);
        double multiplier = employee.getEmploymentType() != null
                ? employee.getEmploymentType().getMultiplier()
                : 1.0;
        return Math.round(workDays * 8 * multiplier * 10.0) / 10.0;
    }

    private Double calculateAvailableHoursForYear(Integer year, Employee employee) {
        double totalHours = 0.0;
        for (int month = 1; month <= 12; month++) {
            totalHours += calculateAvailableHours(year, month, employee);
        }
        return Math.round(totalHours * 10.0) / 10.0;
    }

    private int countWorkDaysInMonth(Integer year, Integer month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        int workDays = 0;
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            DayOfWeek day = date.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                workDays++;
            }
        }
        return workDays;
    }

    private Double calculateSaleBonus(Long empId, Integer year, Integer month, Employee employee) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<SaleItem> saleItems = visitRepo.findSaleItemsWithProducts(empId, startDate, endDate);

        double totalMargin = 0.0;
        for (SaleItem saleItem : saleItems) {
            if (saleItem.getProduct() == null) continue;

            Long productId = saleItem.getProduct().getId();
            List<OrderProduct> latestOrders = orderProductRepo.findLatestByProductId(productId, PageRequest.of(0, 3));

            if (latestOrders.isEmpty()) continue;

            double avgPurchaseNetPrice = latestOrders.stream()
                    .mapToDouble(op -> {
                        double grossPrice = op.getPrice();
                        double vatRate = op.getVatRate() != null ? op.getVatRate().getRate() : VatRate.VAT_23.getRate();
                        return grossPrice * 100 / (100 + vatRate);
                    })
                    .average()
                    .orElse(0.0);

            double saleNetPrice = saleItem.getNetValue() != null ? saleItem.getNetValue() : 0.0;
            double margin = saleNetPrice - avgPurchaseNetPrice;
            if (margin > 0 && avgPurchaseNetPrice != 0.0) {
                totalMargin += margin;
            }
        }

        double saleBonusPercent = employee.getSaleBonusPercent() != null ? employee.getSaleBonusPercent() : 0.0;
        return round2(totalMargin * saleBonusPercent / 100);
    }



    private Double round2(Double value) {
        if (value == null) return 0.0;
        return Math.round(value * 100.0) / 100.0;
    }
}
