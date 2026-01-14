package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.Visit;
import com.podocare.PodoCareWebsite.model.constants.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

}
