package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.UsageRecord;
import com.podocare.PodoCareWebsite.model.constants.UsageReason;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsageRecordRepo extends JpaRepository<UsageRecord, Long> {

    @Query("SELECT ur FROM UsageRecord ur " +
           "LEFT JOIN FETCH ur.product p " +
           "LEFT JOIN FETCH ur.employee e " +
           "WHERE ur.id = :id")
    Optional<UsageRecord> findOneById(@Param("id") Long id);

    @Query(
            value = """
    SELECT DISTINCT ur FROM UsageRecord ur
    LEFT JOIN ur.product p
    LEFT JOIN ur.employee e
    WHERE (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT(:keyword, '%')))
      AND (COALESCE(:employeeIds, NULL) IS NULL OR ur.employee.id IN :employeeIds)
      AND (:usageReason IS NULL OR ur.usageReason = :usageReason)
      AND (ur.usageDate >= :startDate)
      AND (ur.usageDate <= :endDate)
    """,
            countQuery = """
    SELECT COUNT(DISTINCT ur.id) FROM UsageRecord ur
    LEFT JOIN ur.product p
    LEFT JOIN ur.employee e
    WHERE (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT(:keyword, '%')))
      AND (COALESCE(:employeeIds, NULL) IS NULL OR ur.employee.id IN :employeeIds)
      AND (:usageReason IS NULL OR ur.usageReason = :usageReason)
      AND (ur.usageDate >= :startDate)
      AND (ur.usageDate <= :endDate)
    """
    )
    Page<UsageRecord> findAllWithFilters(
            @Param("keyword") String keyword,
            @Param("employeeIds") List<Long> employeeIds,
            @Param("usageReason") UsageReason usageReason,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    @Query("SELECT COUNT(ur) > 0 FROM UsageRecord ur WHERE ur.product.id = :productId")
    boolean existsByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(ur) > 0 FROM UsageRecord ur WHERE ur.employee.id = :employeeId")
    boolean existsByEmployeeId(@Param("employeeId") Long employeeId);
}
