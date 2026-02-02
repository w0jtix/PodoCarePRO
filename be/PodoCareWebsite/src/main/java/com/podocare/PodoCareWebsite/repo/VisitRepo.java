package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.SaleItem;
import com.podocare.PodoCareWebsite.model.Visit;
import com.podocare.PodoCareWebsite.model.constants.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.podocare.PodoCareWebsite.repo.projection.CompanyRevenueProjection;
import com.podocare.PodoCareWebsite.repo.projection.EmployeeRevenueProjection;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VisitRepo extends JpaRepository<Visit, Long>, JpaSpecificationExecutor<Visit> {

    Optional<Visit> findOneById(Long id);

    long countByClientId(Long clientId);

    @Query("""
    SELECT COUNT(DISTINCT v.id)
    FROM Visit v
    WHERE v.client.id = :clientId
    AND SIZE(v.items) > 0
""")
    long countVisitsByClientId(@Param("clientId") Long clientId);

    @Query(
            value = """
    SELECT DISTINCT v FROM Visit v
    LEFT JOIN v.client c
    LEFT JOIN v.employee e
    LEFT JOIN v.serviceDiscounts d
    LEFT JOIN v.items i
    LEFT JOIN v.sale s
    WHERE (:clientIds IS NULL OR c.id IN :clientIds)
      AND (:serviceIds IS NULL OR i.service.id IN :serviceIds)
      AND (:employeeIds IS NULL OR e.id IN :employeeIds)
      AND (:isBoost IS NULL OR v.isBoost = :isBoost)
      AND (:isVip IS NULL OR v.isVip = :isVip)
      AND (:delayed IS NULL OR (:delayed = TRUE AND v.delayTime IS NOT NULL))
      AND (:absence IS NULL OR v.absence = :absence)
      AND (:hasDiscount IS NULL OR (:hasDiscount = TRUE AND d IS NOT NULL))
      AND (:hasSale IS NULL OR (:hasSale = TRUE AND s IS NOT NULL))
      AND (v.date >= :dateFrom)
      AND (v.date <= :dateTo)
      AND (:paymentStatus IS NULL OR v.paymentStatus IN :paymentStatus)
      AND (:totalValueFrom IS NULL OR v.totalValue >= :totalValueFrom)
      AND (:totalValueTo IS NULL OR v.totalValue <= :totalValueTo)
""",
            countQuery = """
        SELECT COUNT(DISTINCT v.id) FROM Visit v
        LEFT JOIN v.client c
        LEFT JOIN v.employee e
        LEFT JOIN v.serviceDiscounts d
        LEFT JOIN v.items i
        LEFT JOIN v.sale s
        WHERE (:clientIds IS NULL OR c.id IN :clientIds)
          AND (:serviceIds IS NULL OR i.service.id IN :serviceIds)
          AND (:employeeIds IS NULL OR e.id IN :employeeIds)
          AND (:isBoost IS NULL OR v.isBoost = :isBoost)
          AND (:isVip IS NULL OR v.isVip = :isVip)
          AND (:delayed IS NULL OR (:delayed = TRUE AND v.delayTime IS NOT NULL))
          AND (:absence IS NULL OR v.absence = :absence)
          AND (:hasDiscount IS NULL OR (:hasDiscount = TRUE AND d IS NOT NULL))
          AND (:hasSale IS NULL OR (:hasSale = TRUE AND s IS NOT NULL))
          AND (v.date >= :dateFrom)
          AND (v.date <= :dateTo)
          AND (:paymentStatus IS NULL OR v.paymentStatus IN :paymentStatus)
          AND (:totalValueFrom IS NULL OR v.totalValue >= :totalValueFrom)
          AND (:totalValueTo IS NULL OR v.totalValue <= :totalValueTo)
        """
    )
    Page<Visit> findAllWithFilters(
            @Param("clientIds") List<Long> clientIds,
            @Param("serviceIds") List<Long> serviceIds,
            @Param("employeeIds") List<Long> employeeIds,
            @Param("isBoost") Boolean isBoost,
            @Param("isVip") Boolean isVip,
            @Param("delayed") Boolean delayed,
            @Param("absence") Boolean absence,
            @Param("hasDiscount") Boolean hasDiscount,
            @Param("hasSale") Boolean hasSale,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("totalValueFrom") Double totalValueFrom,
            @Param("totalValueTo") Double totalValueTo,
            Pageable pageable
    );

    @Query("""
    SELECT vs.id
    FROM Visit vs
    JOIN vs.sale s
    JOIN s.items si
    WHERE si.voucher.id = :voucherId
    """)
    Long findPurchaseVisitIdByVoucherId(@Param("voucherId") Long voucherId);

    @Query("""
    SELECT v
    FROM Visit v
    JOIN v.payments p
    WHERE p.voucher.id = :voucherId
""")
    Optional<Visit> findByVoucherId(@Param("voucherId") Long voucherId);

    @Query("""
    SELECT v
    FROM Visit v
    JOIN v.debtRedemptions dr
    JOIN dr.debtSource ds
    JOIN ds.sourceVisit sv
    WHERE sv.id = :visitId
""")
    Optional<Visit> findByDebtSourceVisitId(@Param("visitId") Long visitId);

    @Query("""
    SELECT v
    FROM Visit v
    JOIN v.debtRedemptions dr
    WHERE dr.debtSource.id = :debtId
""")
    Optional<Visit> findByDebtSourceId(@Param("debtId") Long debtId);

    @Query("""
       SELECT CASE WHEN COUNT(v) > 0 THEN TRUE ELSE FALSE END
       FROM Visit v
       JOIN v.sale s
       JOIN s.items i
       WHERE i.product.id = :productId
       """)
    boolean existsByProductId(@Param("productId") Long productId);

    @Query("""
       SELECT v
       FROM Visit v
       JOIN v.serviceDiscounts sd
       WHERE sd.reviewId = :reviewId
       """)
    Optional<Visit> findByReviewId(@Param("reviewId") Long reviewId);

    boolean existsByClientId(Long clientId);

    // Monthly revenue aggregation - sums payments for non-absence visits grouped by employee and month
    @Query("""
        SELECT e.id AS employeeId,
               e.name AS employeeName,
               MONTH(v.date) AS period,
               COALESCE(SUM(p.amount), 0) AS revenue
        FROM Visit v
        JOIN v.employee e
        LEFT JOIN v.payments p
        WHERE v.absence = false
          AND YEAR(v.date) = :year
        GROUP BY e.id, e.name, MONTH(v.date)
        ORDER BY e.id, MONTH(v.date)
    """)
    List<EmployeeRevenueProjection> findMonthlyRevenueByYear(@Param("year") Integer year);

    // Daily revenue aggregation - sums payments for non-absence visits grouped by employee and day
    @Query("""
        SELECT e.id AS employeeId,
               e.name AS employeeName,
               DAY(v.date) AS period,
               COALESCE(SUM(p.amount), 0) AS revenue
        FROM Visit v
        JOIN v.employee e
        LEFT JOIN v.payments p
        WHERE v.absence = false
          AND YEAR(v.date) = :year
          AND MONTH(v.date) = :month
        GROUP BY e.id, e.name, DAY(v.date)
        ORDER BY e.id, DAY(v.date)
    """)
    List<EmployeeRevenueProjection> findDailyRevenueByYearAndMonth(
            @Param("year") Integer year,
            @Param("month") Integer month
    );

    // ========== Employee Stats Queries ==========

    @Query("""
        SELECT COALESCE(SUM(vi.duration), 0)
        FROM Visit v
        JOIN v.items vi
        WHERE v.employee.id = :empId
          AND v.absence = false
          AND v.date BETWEEN :from AND :to
    """)
    Integer sumHoursWithClients(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(vi.finalPrice), 0)
        FROM Visit v
        JOIN v.items vi
        WHERE v.employee.id = :empId
          AND v.absence = false
          AND v.date BETWEEN :from AND :to
    """)
    Double sumServicesRevenue(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(cd.value), 0)
        FROM Visit v
        JOIN v.debtRedemptions dr
        JOIN dr.debtSource cd
        WHERE v.employee.id = :empId
          AND v.date BETWEEN :from AND :to
          AND cd.type = com.podocare.PodoCareWebsite.model.constants.DebtType.ABSENCE_FEE
    """)
    Double sumAbsenceFeeRedemptions(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(s.totalValue), 0)
        FROM Visit v
        JOIN v.sale s
        WHERE v.employee.id = :empId
          AND v.absence = false
          AND v.date BETWEEN :from AND :to
    """)
    Double sumProductsRevenue(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Visit v
        JOIN v.payments p
        WHERE v.employee.id = :empId
          AND v.absence = false
          AND v.date BETWEEN :from AND :to
    """)
    Double sumTotalRevenue(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COUNT(vi)
        FROM Visit v
        JOIN v.items vi
        WHERE v.employee.id = :empId
          AND v.absence = false
          AND v.date BETWEEN :from AND :to
    """)
    Integer countServicesDone(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COUNT(si)
        FROM Visit v
        JOIN v.sale s
        JOIN s.items si
        WHERE v.employee.id = :empId
          AND v.absence = false
          AND v.date BETWEEN :from AND :to
          AND si.product IS NOT NULL
    """)
    Integer countProductsSold(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COUNT(si)
        FROM Visit v
        JOIN v.sale s
        JOIN s.items si
        WHERE v.employee.id = :empId
          AND v.absence = false
          AND v.date BETWEEN :from AND :to
          AND si.voucher IS NOT NULL
    """)
    Integer countVouchersSold(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COUNT(DISTINCT v.client.id)
        FROM Visit v
        WHERE v.employee.id = :empId
          AND v.date BETWEEN :from AND :to
          AND v.client.id NOT IN (
              SELECT DISTINCT v2.client.id
              FROM Visit v2
              WHERE v2.date < :from
          )
    """)
    Integer countNewClients(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COUNT(DISTINCT v.client.id)
        FROM Visit v
        WHERE v.employee.id = :empId
          AND v.isBoost = true
          AND v.date BETWEEN :from AND :to
          AND v.client.id NOT IN (
              SELECT DISTINCT v2.client.id
              FROM Visit v2
              WHERE v2.date < :from
          )
    """)
    Integer countNewBoostClients(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query(value = """
        SELECT vi.name
        FROM visit v
        JOIN visit_item vi ON vi.visit_id = v.id
        WHERE v.employee_id = :empId
          AND v.absence = false
          AND v.date BETWEEN :from AND :to
        GROUP BY vi.name
        ORDER BY COUNT(vi.id) DESC
        LIMIT 1
    """, nativeQuery = true)
    String findTopSellingServiceName(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query(value = """
        SELECT si.name
        FROM visit v
        JOIN sale s ON v.sale_id = s.id
        JOIN sale_item si ON si.sale_id = s.id
        WHERE v.employee_id = :empId
          AND v.absence = false
          AND v.date BETWEEN :from AND :to
          AND si.product_id IS NOT NULL
        GROUP BY si.name
        ORDER BY COUNT(si.id) DESC
        LIMIT 1
    """, nativeQuery = true)
    String findTopSellingProductName(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COUNT(DISTINCT c.id)
        FROM Client c
        WHERE (SELECT COUNT(v) FROM Visit v
               WHERE v.client.id = c.id AND v.employee.id = :empId) >= 2
    """)
    Integer countClientsWithSecondVisit(@Param("empId") Long empId);

    @Query("""
        SELECT COUNT(DISTINCT c.id)
        FROM Client c
        WHERE (c.boostClient = true OR c.id IN (
            SELECT DISTINCT v.client.id
            FROM Visit v
            WHERE v.isBoost = true AND v.employee.id = :empId
        ))
        AND (SELECT COUNT(v2) FROM Visit v2 WHERE v2.client.id = c.id AND v2.employee.id = :empId) >= 2
    """)
    Integer countBoostClientsWithSecondVisit(@Param("empId") Long empId);

    @Query("""
        SELECT COUNT(DISTINCT c.id)
        FROM Client c
        WHERE c.id IN (
            SELECT DISTINCT v.client.id
            FROM Visit v
            WHERE v.employee.id = :empId
        )
    """)
    Integer countTotalClients(@Param("empId") Long empId);

    @Query("""
        SELECT COUNT(DISTINCT c.id)
        FROM Client c
        WHERE c.id IN (
            SELECT DISTINCT v.client.id
            FROM Visit v
            WHERE v.employee.id = :empId AND (v.isBoost = true OR v.client.boostClient = true)
        )
    """)
    Integer countTotalBoostClients(@Param("empId") Long empId);

    @Query("""
        SELECT si
        FROM Visit v
        JOIN v.sale s
        JOIN s.items si
        WHERE v.employee.id = :empId
          AND v.absence = false
          AND v.date BETWEEN :from AND :to
          AND si.product IS NOT NULL
    """)
    List<SaleItem> findSaleItemsWithProducts(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Visit v
        JOIN v.payments p
        WHERE v.employee.id = :empId
          AND v.absence = false
          AND v.date BETWEEN :from AND :to
          AND p.method = com.podocare.PodoCareWebsite.model.constants.PaymentMethod.VOUCHER
    """)
    Double sumVoucherPayments(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(si.price), 0)
        FROM Visit v
        JOIN v.sale s
        JOIN s.items si
        WHERE v.employee.id = :empId
          AND v.absence = false
          AND v.date BETWEEN :from AND :to
          AND si.voucher IS NOT NULL
    """)
    Double sumVouchersSoldValue(
            @Param("empId") Long empId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT MONTH(v.date) AS period,
               COALESCE(SUM(p.amount), 0) AS revenue
        FROM Visit v
        LEFT JOIN v.payments p
        WHERE v.absence = false
          AND YEAR(v.date) = :year
        GROUP BY MONTH(v.date)
        ORDER BY MONTH(v.date)
    """)
    List<CompanyRevenueProjection> findCompanyMonthlyRevenueByYear(@Param("year") Integer year);

    @Query("""
        SELECT DAY(v.date) AS period,
               COALESCE(SUM(p.amount), 0) AS revenue
        FROM Visit v
        LEFT JOIN v.payments p
        WHERE v.absence = false
          AND YEAR(v.date) = :year
          AND MONTH(v.date) = :month
        GROUP BY DAY(v.date)
        ORDER BY DAY(v.date)
    """)
    List<CompanyRevenueProjection> findCompanyDailyRevenueByYearAndMonth(
            @Param("year") Integer year,
            @Param("month") Integer month
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Visit v
        JOIN v.payments p
        WHERE v.absence = false
          AND v.date BETWEEN :from AND :to
    """)
    Double sumCompanyTotalRevenue(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(vi.finalPrice), 0)
        FROM Visit v
        JOIN v.items vi
        WHERE v.absence = false
          AND v.date BETWEEN :from AND :to
    """)
    Double sumCompanyServicesRevenue(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(s.totalValue), 0)
        FROM Visit v
        JOIN v.sale s
        WHERE v.absence = false
          AND v.date BETWEEN :from AND :to
    """)
    Double sumCompanyProductsRevenue(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Visit v
        JOIN v.payments p
        WHERE v.absence = false
          AND v.date BETWEEN :from AND :to
          AND p.method = com.podocare.PodoCareWebsite.model.constants.PaymentMethod.VOUCHER
    """)
    Double sumCompanyVoucherPayments(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(si.price), 0)
        FROM Visit v
        JOIN v.sale s
        JOIN s.items si
        WHERE v.absence = false
          AND v.date BETWEEN :from AND :to
          AND si.voucher IS NOT NULL
    """)
    Double sumCompanyVouchersSoldValue(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(cd.value), 0)
        FROM Visit v
        JOIN v.debtRedemptions dr
        JOIN dr.debtSource cd
        WHERE v.absence = false
          AND v.date BETWEEN :from AND :to
    """)
    Double sumCompanyAllDebtRedemptions(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(cd.value), 0)
        FROM Visit v
        JOIN v.debtRedemptions dr
        JOIN dr.debtSource cd
        WHERE v.absence = false
          AND v.date BETWEEN :from AND :to
          AND cd.createdAt < :from
    """)
    Double sumCompanyPreviousPeriodDebtRedemptions(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(vi.finalPrice), 0)
        FROM Visit v
        JOIN v.items vi
        WHERE v.absence = false
          AND v.paymentStatus = com.podocare.PodoCareWebsite.model.constants.PaymentStatus.PARTIAL
          AND v.date BETWEEN :from AND :to
    """)
    Double sumCompanyPartialVisitsServicesValue(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Visit v
        JOIN v.payments p
        WHERE v.absence = false
          AND v.paymentStatus = com.podocare.PodoCareWebsite.model.constants.PaymentStatus.PARTIAL
          AND v.date BETWEEN :from AND :to
    """)
    Double sumCompanyPartialVisitsPayments(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

}
